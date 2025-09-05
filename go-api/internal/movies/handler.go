package movies

import (
	"encoding/json"
	"net/http"
	"time"

	"example.com/api/internal/database"
	"example.com/api/internal/models"
	"github.com/go-chi/chi/v5"
	jwt "github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func Routes(db *database.MongoDB) http.Handler {
	r := chi.NewRouter()

	r.Post("/register", func(w http.ResponseWriter, r *http.Request) {
		var req models.RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		if req.Password != req.ConfirmPassword {
			http.Error(w, "Passwords do not match", http.StatusBadRequest)
			return
		}
		if len(req.Password) < 6 {
			http.Error(w, "Password too short", http.StatusBadRequest)
			return
		}
		coll := db.GetCollection("users")
		countEmail, err := coll.CountDocuments(r.Context(), bson.M{"email": req.Email})
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		if countEmail > 0 {
			http.Error(w, "Email already registered", http.StatusConflict)
			return
		}
		countUsername, err := coll.CountDocuments(r.Context(), bson.M{"username": req.Username})
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		if countUsername > 0 {
			http.Error(w, "Username already taken", http.StatusConflict)
			return
		}
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Hash error", http.StatusInternalServerError)
			return
		}
		user := bson.M{
			"_id":        primitive.NewObjectID(),
			"username":   req.Username,
			"email":      req.Email,
			"name":       req.FirstName + " " + req.LastName,
			"avatar":     "",
			"bio":        "",
			"is_public":  true,
			"created_at": time.Now(),
			"updated_at": time.Now(),
			"password":   string(hashed),
		}
		_, err = coll.InsertOne(r.Context(), user)
		if err != nil {
			http.Error(w, "Insert error", http.StatusInternalServerError)
			return
		}
		jsonOK(w, map[string]string{"message": "Inscription réussie"})
	})

	r.Post("/login", func(w http.ResponseWriter, r *http.Request) {
		var req models.LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		coll := db.GetCollection("users")
		var user bson.M
		err := coll.FindOne(r.Context(), bson.M{"email": req.Email}).Decode(&user)
		if err != nil {
			http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
			return
		}
		pwd, ok := user["password"].(string)
		if !ok || bcrypt.CompareHashAndPassword([]byte(pwd), []byte(req.Password)) != nil {
			http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
			return
		}
		secret := []byte("SuperSecretKeyChangeMe")
		userID := ""
		if id, ok := user["_id"].(primitive.ObjectID); ok {
			userID = id.Hex()
		}
		email := ""
		if em, ok := user["email"].(string); ok {
			email = em
		}
		claims := jwt.MapClaims{
			"userId": userID,
			"email":  email,
			"exp":    time.Now().Add(72 * time.Hour).Unix(),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString(secret)
		if err != nil {
			http.Error(w, "Token error", http.StatusInternalServerError)
			return
		}
		jsonOK(w, map[string]string{"token": tokenString})
	})

	r.Get("/", func(w http.ResponseWriter, _ *http.Request) {
		movies := []models.Movie{
			{
				ID:       primitive.NewObjectID(),
				Title:    "Inception",
				Year:     2010,
				Director: "Christopher Nolan",
				Genres:   []string{"Sci-Fi", "Thriller"},
				IMDbID:   "tt1375666",
			},
			{
				ID:       primitive.NewObjectID(),
				Title:    "The Matrix",
				Year:     1999,
				Director: "The Wachowskis",
				Genres:   []string{"Sci-Fi", "Action"},
				IMDbID:   "tt0133093",
			},
		}
		jsonOK(w, movies)
	})

	r.Post("/", func(w http.ResponseWriter, r *http.Request) {
		var req models.CreateMovieRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		jsonOK(w, map[string]string{"message": "Movie created successfully"})
	})

	return r
}

func HistoryRoutes(db *database.MongoDB) http.Handler {
	r := chi.NewRouter()

	r.Get("/", func(w http.ResponseWriter, _ *http.Request) {
		history := []models.WatchHistory{
			{
				ID:          primitive.NewObjectID(),
				UserID:      primitive.NewObjectID(),
				MovieID:     primitive.NewObjectID(),
				WatchedDate: time.Now().AddDate(0, 0, -2),
				Rating:      4.5,
				Review:      "Amazing movie! Mind-blowing plot.",
				Mood:        "amazed",
				WatchedWith: []string{"Sarah", "John"},
				IsPublic:    true,
				Tags:        []string{"must-rewatch", "date-night"},
				Location:    "Cinema City",
				Context:     "Weekend movie night",
			},
		}
		jsonOK(w, history)
	})

	r.Post("/", func(w http.ResponseWriter, r *http.Request) {
		var req models.CreateWatchHistoryRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		jsonOK(w, map[string]string{"message": "Added to watch history"})
	})

	return r
}

func jsonOK(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
