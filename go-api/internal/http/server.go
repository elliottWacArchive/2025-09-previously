package http

import (
	"net/http"
	"os"

	"example.com/api/internal/auth"
	"example.com/api/internal/database"
	"example.com/api/internal/movies"
	"example.com/api/internal/watchlist"
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

	apiKey := os.Getenv("BETASERIES_API_KEY")
	clientSecret := os.Getenv("BETASERIES_CLIENT_SECRET")
	redirectURI := os.Getenv("BETASERIES_REDIRECT_URI")

	authSystem := auth.NewBetaSeriesAuth(apiKey, clientSecret, redirectURI, db)
	authHandlers := auth.NewAuthHandlers(authSystem)

	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(200)
			w.Write([]byte("🎬 Previously On API is running!"))
		})

		api.Mount("/auth", auth.Routes(authHandlers))

		api.Mount("/movies", movies.Routes(db))

		api.Mount("/history", movies.HistoryRoutes(db))

		api.Mount("/watchlist", watchlist.Routes(db, authHandlers))
	})
	return r
}
