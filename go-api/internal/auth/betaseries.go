package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"example.com/api/internal/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BetaSeriesAuth struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	db           *database.MongoDB
}

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BetaSeriesID   int                `bson:"betaseries_id" json:"betaseries_id"`
	Login          string             `bson:"login" json:"login"`
	Email          string             `bson:"email" json:"email"`
	AccessToken    string             `bson:"access_token" json:"access_token"`
	RefreshToken   string             `bson:"refresh_token,omitempty" json:"refresh_token,omitempty"`
	TokenExpiresAt *time.Time         `bson:"token_expires_at,omitempty" json:"token_expires_at,omitempty"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}

type BetaSeriesTokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresIn    int    `json:"expires_in,omitempty"`
}

type BetaSeriesUserInfo struct {
	Member struct {
		ID    int    `json:"id"`
		Login string `json:"login"`
	} `json:"member"`
}

func NewBetaSeriesAuth(clientID, clientSecret, redirectURI string, db *database.MongoDB) *BetaSeriesAuth {
	return &BetaSeriesAuth{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURI:  redirectURI,
		db:           db,
	}
}

func (b *BetaSeriesAuth) GetAuthURL(state string) string {
	params := url.Values{}
	params.Add("response_type", "code")
	params.Add("client_id", b.ClientID)
	params.Add("redirect_uri", b.RedirectURI)
	params.Add("state", state)

	return fmt.Sprintf("https://www.betaseries.com/authorize?%s", params.Encode())
}

func (b *BetaSeriesAuth) ExchangeCodeForToken(code string) (*BetaSeriesTokenResponse, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("client_id", b.ClientID)
	data.Set("client_secret", b.ClientSecret)
	data.Set("redirect_uri", b.RedirectURI)
	data.Set("code", code)

	req, err := http.NewRequest("POST", "https://api.betaseries.com/oauth/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to exchange code for token: status %d", resp.StatusCode)
	}

	var tokenResp BetaSeriesTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	return &tokenResp, nil
}

func (b *BetaSeriesAuth) GetUserInfo(accessToken string) (*BetaSeriesUserInfo, error) {
	req, err := http.NewRequest("GET", "https://api.betaseries.com/members/infos", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-BetaSeries-Key", b.ClientID)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	fmt.Printf("DEBUG: Making request to BetaSeries with headers: X-BetaSeries-Key=%s, Authorization=Bearer %s\n", b.ClientID, accessToken[:10]+"...")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("DEBUG: BetaSeries response status: %d\n", resp.StatusCode)
	fmt.Printf("DEBUG: BetaSeries response body: %s\n", string(body))

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user info: status %d, body: %s", resp.StatusCode, string(body))
	}

	var userInfo BetaSeriesUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}

	fmt.Printf("DEBUG: Parsed user info: %+v\n", userInfo)

	return &userInfo, nil
}

func (b *BetaSeriesAuth) SaveUser(userInfo *BetaSeriesUserInfo, tokenResp *BetaSeriesTokenResponse) (*User, error) {
	collection := b.db.GetCollection("users")
	ctx := context.Background()

	var expiresAt *time.Time
	if tokenResp.ExpiresIn > 0 {
		expiration := time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)
		expiresAt = &expiration
	}

	user := User{
		BetaSeriesID:   userInfo.Member.ID,
		Login:          userInfo.Member.Login,
		Email:          userInfo.Member.Login,
		AccessToken:    tokenResp.AccessToken,
		RefreshToken:   tokenResp.RefreshToken,
		TokenExpiresAt: expiresAt,
		UpdatedAt:      time.Now(),
	}

	filter := bson.M{"betaseries_id": userInfo.Member.ID}
	update := bson.M{
		"$set": bson.M{
			"login":            user.Login,
			"email":            user.Email,
			"access_token":     user.AccessToken,
			"refresh_token":    user.RefreshToken,
			"token_expires_at": user.TokenExpiresAt,
			"updated_at":       user.UpdatedAt,
		},
		"$setOnInsert": bson.M{
			"created_at": time.Now(),
		},
	}

	options := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)
	result := collection.FindOneAndUpdate(ctx, filter, update, options)

	var updatedUser User
	if err := result.Decode(&updatedUser); err != nil {
		return nil, err
	}

	return &updatedUser, nil
}

func (b *BetaSeriesAuth) GetUserByToken(accessToken string) (*User, error) {
	collection := b.db.GetCollection("users")
	ctx := context.Background()

	var user User
	filter := bson.M{"access_token": accessToken}

	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return nil, err
	}

	if user.TokenExpiresAt != nil && time.Now().After(*user.TokenExpiresAt) {
		if user.RefreshToken != "" {
			refreshedUser, err := b.RefreshToken(user.RefreshToken)
			if err == nil {
				return refreshedUser, nil
			}
		}
		return nil, fmt.Errorf("token expired and refresh failed")
	}

	return &user, nil
}

func (b *BetaSeriesAuth) RefreshToken(refreshToken string) (*User, error) {
	data := url.Values{}
	data.Set("grant_type", "refresh_token")
	data.Set("client_id", b.ClientID)
	data.Set("client_secret", b.ClientSecret)
	data.Set("refresh_token", refreshToken)

	req, err := http.NewRequest("POST", "https://api.betaseries.com/oauth/access_token", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to refresh token: status %d", resp.StatusCode)
	}

	var tokenResp BetaSeriesTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	collection := b.db.GetCollection("users")
	ctx := context.Background()

	var expiresAt *time.Time
	if tokenResp.ExpiresIn > 0 {
		expiration := time.Now().Add(time.Duration(tokenResp.ExpiresIn) * time.Second)
		expiresAt = &expiration
	}

	filter := bson.M{"refresh_token": refreshToken}
	update := bson.M{
		"$set": bson.M{
			"access_token":     tokenResp.AccessToken,
			"refresh_token":    tokenResp.RefreshToken,
			"token_expires_at": expiresAt,
			"updated_at":       time.Now(),
		},
	}

	updateOptions := options.FindOneAndUpdate().SetReturnDocument(options.After)
	result := collection.FindOneAndUpdate(ctx, filter, update, updateOptions)

	var updatedUser User
	if err := result.Decode(&updatedUser); err != nil {
		return nil, err
	}

	return &updatedUser, nil
}

func (b *BetaSeriesAuth) RevokeToken(accessToken string) error {
	collection := b.db.GetCollection("users")
	ctx := context.Background()

	filter := bson.M{"access_token": accessToken}
	update := bson.M{
		"$unset": bson.M{
			"access_token":     "",
			"refresh_token":    "",
			"token_expires_at": "",
		},
		"$set": bson.M{
			"updated_at": time.Now(),
		},
	}

	_, err := collection.UpdateOne(ctx, filter, update)
	return err
}
