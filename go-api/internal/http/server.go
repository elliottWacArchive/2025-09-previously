package http

import (
	"net/http"

	"example.com/api/internal/database"
	"example.com/api/internal/movies"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(db *database.MongoDB) http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.Logger, middleware.Recoverer)

	r.Mount("/", movies.Routes(db))

	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(200)
			w.Write([]byte("🎬 Previously On API is running!"))
		})

		api.Mount("/movies", movies.Routes(db))

		api.Mount("/history", movies.HistoryRoutes(db))
	})
	return r
}
