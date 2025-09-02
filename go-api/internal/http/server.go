package http

import (
	"net/http"

	"example.com/api/internal/database"
	"example.com/api/internal/movies"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewRouter(db *database.MongoDB) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger, middleware.Recoverer)

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
