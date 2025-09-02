print("initialisation...");

db = db.getSiblingDB("previously_on");

// creation collections
db.createCollection("movies", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "year"],
            properties: {
                title: {
                    bsonType: "string",
                    description: "Movie title is required",
                },
                year: {
                    bsonType: "int",
                    minimum: 1888,
                    maximum: 2030,
                    description: "Valid year is required",
                },
                director: {
                    bsonType: "string",
                },
                genres: {
                    bsonType: "array",
                    items: {
                        bsonType: "string",
                    },
                },
            },
        },
    },
});

db.createCollection("watch_history", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["user_id", "movie_id", "watched_date"],
            properties: {
                rating: {
                    bsonType: "double",
                    minimum: 0,
                    maximum: 5,
                },
            },
        },
    },
});

db.createCollection("users");
db.movies.createIndex({ title: "text" });
db.movies.createIndex({ imdb_id: 1 }, { unique: true, sparse: true });
db.watch_history.createIndex({ user_id: 1, watched_date: -1 });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

print("✅ Database initialized successfully!");
