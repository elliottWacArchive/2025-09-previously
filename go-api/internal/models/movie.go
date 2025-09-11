package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Movie struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title     string             `bson:"title" json:"title"`
	Year      int                `bson:"year" json:"year"`
	Director  string             `bson:"director" json:"director"`
	Genres    []string           `bson:"genres" json:"genres"`
	Poster    string             `bson:"poster" json:"poster"`
	IMDbID    string             `bson:"imdb_id" json:"imdb_id"`
	Plot      string             `bson:"plot" json:"plot"`
	Runtime   int                `bson:"runtime" json:"runtime"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type WatchHistory struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	MovieID     primitive.ObjectID `bson:"movie_id" json:"movie_id"`
	Movie       *Movie             `bson:"movie,omitempty" json:"movie,omitempty"`
	WatchedDate time.Time          `bson:"watched_date" json:"watched_date"`
	Rating      float64            `bson:"rating" json:"rating"`
	Review      string             `bson:"review" json:"review"`
	Mood        string             `bson:"mood" json:"mood"`
	WatchedWith []string           `bson:"watched_with" json:"watched_with"`
	IsPublic    bool               `bson:"is_public" json:"is_public"`
	Tags        []string           `bson:"tags" json:"tags"`
	Location    string             `bson:"location" json:"location"`
	Context     string             `bson:"context" json:"context"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username  string             `bson:"username" json:"username"`
	Email     string             `bson:"email" json:"email"`
	Name      string             `bson:"name" json:"name"`
	Avatar    string             `bson:"avatar" json:"avatar"`
	Bio       string             `bson:"bio" json:"bio"`
	IsPublic  bool               `bson:"is_public" json:"is_public"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type CreateMovieRequest struct {
	Title    string   `json:"title" validate:"required"`
	Year     int      `json:"year" validate:"required"`
	Director string   `json:"director"`
	Genres   []string `json:"genres"`
	IMDbID   string   `json:"imdb_id"`
}

type CreateWatchHistoryRequest struct {
	MovieID     string    `json:"movie_id" validate:"required"`
	WatchedDate time.Time `json:"watched_date"`
	Rating      float64   `json:"rating"`
	Review      string    `json:"review"`
	Mood        string    `json:"mood"`
	WatchedWith []string  `json:"watched_with"`
	IsPublic    bool      `json:"is_public"`
	Tags        []string  `json:"tags"`
	Location    string    `json:"location"`
	Context     string    `json:"context"`
}

type WatchlistItem struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	ItemID      string             `bson:"item_id" json:"item_id"`
	ItemType    string             `bson:"item_type" json:"item_type"`
	Title       string             `bson:"title" json:"title"`
	Poster      string             `bson:"poster" json:"poster"`
	ReleaseDate string             `bson:"release_date" json:"release_date"`
	Overview    string             `bson:"overview" json:"overview"`
	VoteAverage float64            `bson:"vote_average" json:"vote_average"`
	Genres      []string           `bson:"genres" json:"genres"`
	ItemData    interface{}        `bson:"item_data" json:"item_data"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

type AddToWatchlistRequest struct {
	ItemID      string      `json:"item_id" validate:"required"`
	ItemType    string      `json:"item_type" validate:"required"`
	Title       string      `json:"title" validate:"required"`
	Poster      string      `json:"poster"`
	ReleaseDate string      `json:"release_date"`
	Overview    string      `json:"overview"`
	VoteAverage float64     `json:"vote_average"`
	Genres      []string    `json:"genres"`
	ItemData    interface{} `json:"item_data"`
}
