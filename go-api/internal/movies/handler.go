package movies

import (
	"encoding/json"
	"net/http"
	"time"

	"example.com/api/internal/database"
	"example.com/api/internal/models"
	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Routes(db *database.MongoDB) http.Handler {
	r := chi.NewRouter()

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

		// TODO: Ajouter le film à la base de données
		jsonOK(w, map[string]string{"message": "Movie created successfully"})
	})

	return r
}

// routes de l'historique de visionnage
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

		// TODO: Ajouter à l'historique dans la base de données
		jsonOK(w, map[string]string{"message": "Added to watch history"})
	})

	return r
}

func jsonOK(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
