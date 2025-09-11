package watchlist

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"example.com/api/internal/auth"
	"example.com/api/internal/database"
	"example.com/api/internal/models"
	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Routes(db *database.MongoDB, authHandlers *auth.AuthHandlers) http.Handler {
	r := chi.NewRouter()

	r.Use(authHandlers.AuthMiddleware)

	r.Get("/", getWatchlist(db))
	r.Post("/", addToWatchlist(db))
	r.Delete("/{itemId}", removeFromWatchlist(db))
	r.Get("/check/{itemId}", checkWatchlistStatus(db))

	return r
}

func getWatchlist(db *database.MongoDB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := auth.GetUserFromContext(r.Context())
		if !ok || user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		userID := user.ID

		collection := db.GetCollection("watchlist")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		itemType := r.URL.Query().Get("type")

		filter := bson.M{"user_id": userID}
		if itemType != "" {
			filter["item_type"] = itemType
		}

		opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
		cursor, err := collection.Find(ctx, filter, opts)
		if err != nil {
			http.Error(w, "Error fetching watchlist", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var watchlistItems []models.WatchlistItem
		if err := cursor.All(ctx, &watchlistItems); err != nil {
			http.Error(w, "Error decoding watchlist", http.StatusInternalServerError)
			return
		}

		if watchlistItems == nil {
			watchlistItems = []models.WatchlistItem{}
		}

		jsonOK(w, map[string]interface{}{
			"watchlist": watchlistItems,
			"count":     len(watchlistItems),
		})
	}
}

func addToWatchlist(db *database.MongoDB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := auth.GetUserFromContext(r.Context())
		if !ok || user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req models.AddToWatchlistRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if req.ItemType != "movie" && req.ItemType != "serie" {
			http.Error(w, "Item type must be 'movie' or 'serie'", http.StatusBadRequest)
			return
		}

		userID := user.ID

		collection := db.GetCollection("watchlist")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		existingItem := collection.FindOne(ctx, bson.M{
			"user_id":   userID,
			"item_id":   req.ItemID,
			"item_type": req.ItemType,
		})

		if existingItem.Err() == nil {
			http.Error(w, "Item already in watchlist", http.StatusConflict)
			return
		}

		watchlistItem := models.WatchlistItem{
			ID:          primitive.NewObjectID(),
			UserID:      userID,
			ItemID:      req.ItemID,
			ItemType:    req.ItemType,
			Title:       req.Title,
			Poster:      req.Poster,
			ReleaseDate: req.ReleaseDate,
			Overview:    req.Overview,
			VoteAverage: req.VoteAverage,
			Genres:      req.Genres,
			ItemData:    req.ItemData,
			CreatedAt:   time.Now(),
		}

		_, err := collection.InsertOne(ctx, watchlistItem)
		if err != nil {
			http.Error(w, "Error adding to watchlist", http.StatusInternalServerError)
			return
		}

		jsonOK(w, map[string]interface{}{
			"message": "Item added to watchlist successfully",
			"item":    watchlistItem,
		})
	}
}

func removeFromWatchlist(db *database.MongoDB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := auth.GetUserFromContext(r.Context())
		if !ok || user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		itemID := chi.URLParam(r, "itemId")
		if itemID == "" {
			http.Error(w, "Item ID is required", http.StatusBadRequest)
			return
		}

		userID := user.ID

		collection := db.GetCollection("watchlist")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		itemType := r.URL.Query().Get("type")

		filter := bson.M{
			"user_id": userID,
			"item_id": itemID,
		}
		if itemType != "" {
			filter["item_type"] = itemType
		}

		result, err := collection.DeleteOne(ctx, filter)
		if err != nil {
			http.Error(w, "Error removing from watchlist", http.StatusInternalServerError)
			return
		}

		if result.DeletedCount == 0 {
			http.Error(w, "Item not found in watchlist", http.StatusNotFound)
			return
		}

		jsonOK(w, map[string]string{
			"message": "Item removed from watchlist successfully",
		})
	}
}

func checkWatchlistStatus(db *database.MongoDB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, ok := auth.GetUserFromContext(r.Context())
		if !ok || user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		itemID := chi.URLParam(r, "itemId")
		if itemID == "" {
			http.Error(w, "Item ID is required", http.StatusBadRequest)
			return
		}

		userID := user.ID

		collection := db.GetCollection("watchlist")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		itemType := r.URL.Query().Get("type")
		filter := bson.M{
			"user_id": userID,
			"item_id": itemID,
		}
		if itemType != "" {
			filter["item_type"] = itemType
		}

		count, err := collection.CountDocuments(ctx, filter)
		if err != nil {
			http.Error(w, "Error checking watchlist status", http.StatusInternalServerError)
			return
		}

		jsonOK(w, map[string]interface{}{
			"in_watchlist": count > 0,
			"item_id":      itemID,
		})
	}
}

func jsonOK(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
