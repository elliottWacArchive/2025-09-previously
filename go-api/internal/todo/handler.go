package todo

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

func Routes() http.Handler {
	r := chi.NewRouter()
	r.Get("/", func(w http.ResponseWriter, _ *http.Request) {
		jsonOK(w, []todo{{1, "learn go", false}})
	})
	r.Post("/", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(201)
		w.Write([]byte(`{"ok":true}`))
	})
	return r
}

func jsonOK(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
