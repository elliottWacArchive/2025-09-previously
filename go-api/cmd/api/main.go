package main

import (
	"log"
	"net/http"
	"os"

	httpserver "example.com/api/internal/http"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	addr := ":" + env("PORT", "8000")
	srv := &http.Server{
		Addr:    addr,
		Handler: httpserver.NewRouter(),
	}
	log.Println("api on", addr)
	log.Fatal(srv.ListenAndServe())
}

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
