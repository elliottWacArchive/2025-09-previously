package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

type AuthHandlers struct {
	auth *BetaSeriesAuth
}

type AuthURLResponse struct {
	URL string `json:"url"`
}

type LoginRequest struct {
	Code  string `json:"code"`
	State string `json:"state"`
}

type LoginResponse struct {
	User        *User  `json:"user"`
	AccessToken string `json:"access_token"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func NewAuthHandlers(auth *BetaSeriesAuth) *AuthHandlers {
	return &AuthHandlers{auth: auth}
}

func (h *AuthHandlers) Routes() chi.Router {
	r := chi.NewRouter()

	r.Get("/login", h.GetAuthURL)
	r.Post("/callback", h.HandleCallback)
	r.Post("/logout", h.HandleLogout)
	r.Get("/me", h.GetCurrentUser)

	return r
}

type contextKey string

const userContextKey contextKey = "user"

func SetUserInContext(ctx context.Context, user *User) context.Context {
	return context.WithValue(ctx, userContextKey, user)
}

func GetUserFromContext(ctx context.Context) (*User, bool) {
	user, ok := ctx.Value(userContextKey).(*User)
	return user, ok
}

func (h *AuthHandlers) GetAuthURL(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	if state == "" {
		state = "default_state"
	}

	authURL := h.auth.GetAuthURL(state)

	response := AuthURLResponse{URL: authURL}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandlers) HandleCallback(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Code == "" {
		http.Error(w, `{"error":"Authorization code is required"}`, http.StatusBadRequest)
		return
	}

	tokenResp, err := h.auth.ExchangeCodeForToken(req.Code)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to exchange code for token: %s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	userInfo, err := h.auth.GetUserInfo(tokenResp.AccessToken)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to get user info: %s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	user, err := h.auth.SaveUser(userInfo, tokenResp)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to save user: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	response := LoginResponse{
		User:        user,
		AccessToken: tokenResp.AccessToken,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *AuthHandlers) HandleLogout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, `{"error":"Authorization header is required"}`, http.StatusUnauthorized)
		return
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		http.Error(w, `{"error":"Invalid authorization header format"}`, http.StatusUnauthorized)
		return
	}

	accessToken := tokenParts[1]

	if err := h.auth.RevokeToken(accessToken); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to revoke token: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Successfully logged out"}`))
}

func (h *AuthHandlers) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, `{"error":"Authorization header is required"}`, http.StatusUnauthorized)
		return
	}

	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		http.Error(w, `{"error":"Invalid authorization header format"}`, http.StatusUnauthorized)
		return
	}

	accessToken := tokenParts[1]

	user, err := h.auth.GetUserByToken(accessToken)
	if err != nil {
		http.Error(w, `{"error":"Invalid or expired token"}`, http.StatusUnauthorized)
		return
	}

	userResponse := *user
	userResponse.AccessToken = ""
	userResponse.RefreshToken = ""

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userResponse)
}

func (h *AuthHandlers) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"Authorization header is required"}`, http.StatusUnauthorized)
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.Error(w, `{"error":"Invalid authorization header format"}`, http.StatusUnauthorized)
			return
		}

		accessToken := tokenParts[1]
		user, err := h.auth.GetUserByToken(accessToken)
		if err != nil {
			http.Error(w, `{"error":"Invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		ctx := r.Context()
		ctx = SetUserInContext(ctx, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func Routes(handlers *AuthHandlers) http.Handler {
	r := chi.NewRouter()

	r.Get("/login", handlers.GetAuthURL)
	r.Post("/callback", handlers.HandleCallback)
	r.Post("/logout", handlers.HandleLogout)
	r.Get("/me", handlers.GetCurrentUser)

	return r
}
