package main

import (
	"log"
	"net/http"
	"os"

	"example.com/api/internal/database"
	httpserver "example.com/api/internal/http"
	"github.com/joho/godotenv"
)

func main() {
	// .env
	_ = godotenv.Load()

	// config
	port := env("PORT", "8000")
	mongoURI := env("MONGODB_URI", "mongodb://localhost:27017")
	mongoDB := env("MONGODB_DATABASE", "previously_on")

	// mongo connexion
	db, err := database.NewMongoDB(mongoURI, mongoDB)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer db.Close()

	addr := ":" + port
	srv := &http.Server{
		Addr:    addr,
		Handler: httpserver.NewRouter(db),
	}

	log.Printf("🎬 Previously On API starting on %s", addr)
	log.Printf("📊 Connected to MongoDB: %s", mongoDB)
	log.Fatal(srv.ListenAndServe())
}

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
