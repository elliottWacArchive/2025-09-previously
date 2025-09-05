export const TMDB_CONFIG = {
    BASE_URL: "https://api.themoviedb.org/3",
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
    API_KEY:
        process.env.NEXT_PUBLIC_TMDB_API_KEY ||
        "TMDB_API_KEY_SUPPRIMEE",
    IMAGE_SIZES: {
        poster: "w500",
        backdrop: "w1280",
        profile: "w185",
    },
};

export const tmdbApi = {
    getLatestReleases: async () => {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/movie/now_playing?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR&page=1`
            );
            if (!response.ok) throw new Error("Failed to fetch movies");
            const data = await response.json();

            const genresResponse = await fetch(
                `${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
            );
            const genresData = await genresResponse.json();
            const genresMap = genresData.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});

            data.results = data.results.map((movie) => ({
                ...movie,
                genreNames: movie.genre_ids
                    .map((id) => genresMap[id])
                    .filter(Boolean),
            }));

            return data;
        } catch (error) {
            console.error("Error fetching latest releases:", error);
            return { results: [] };
        }
    },

    getImageUrl: (path, size = "w500") => {
        if (!path) return "/placeholder-movie.jpg";
        return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
    },
};
