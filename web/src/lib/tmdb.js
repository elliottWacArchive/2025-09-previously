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

            const moviesWithImages = await Promise.all(
                data.results.map(async (movie) => {
                    try {
                        const imagesResponse = await fetch(
                            `${TMDB_CONFIG.BASE_URL}/movie/${movie.id}/images?api_key=${TMDB_CONFIG.API_KEY}`
                        );
                        const imagesData = await imagesResponse.json();

                        const logo = imagesData.logos?.find(
                            (logo) =>
                                logo.iso_639_1 === "fr" ||
                                logo.iso_639_1 === "en" ||
                                logo.iso_639_1 === null
                        );

                        return {
                            ...movie,
                            genreNames: movie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: logo?.file_path || null,
                        };
                    } catch (error) {
                        console.error(
                            `Error fetching images for movie ${movie.id}:`,
                            error
                        );
                        return {
                            ...movie,
                            genreNames: movie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: null,
                        };
                    }
                })
            );

            return { ...data, results: moviesWithImages };
        } catch (error) {
            console.error("Error fetching latest releases:", error);
            return { results: [] };
        }
    },

    getTopRated: async (page = 1) => {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/movie/top_rated?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR&page=${page}`
            );
            if (!response.ok)
                throw new Error("Failed to fetch top rated movies");
            const data = await response.json();

            const genresResponse = await fetch(
                `${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
            );
            const genresData = await genresResponse.json();
            const genresMap = genresData.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});

            const moviesWithImages = await Promise.all(
                data.results.map(async (movie) => {
                    try {
                        const imagesResponse = await fetch(
                            `${TMDB_CONFIG.BASE_URL}/movie/${movie.id}/images?api_key=${TMDB_CONFIG.API_KEY}`
                        );
                        const imagesData = await imagesResponse.json();

                        const logo = imagesData.logos?.find(
                            (logo) =>
                                logo.iso_639_1 === "fr" ||
                                logo.iso_639_1 === "en" ||
                                logo.iso_639_1 === null
                        );

                        return {
                            ...movie,
                            genreNames: movie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: logo?.file_path || null,
                        };
                    } catch (error) {
                        console.error(
                            `Error fetching images for movie ${movie.id}:`,
                            error
                        );
                        return {
                            ...movie,
                            genreNames: movie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: null,
                        };
                    }
                })
            );

            return { ...data, results: moviesWithImages };
        } catch (error) {
            console.error("Error fetching top rated movies:", error);
            return { results: [] };
        }
    },

    getTopRatedMovies: async () => {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/movie/top_rated?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR&page=1`
            );
            const data = await response.json();

            const genresResponse = await fetch(
                `${TMDB_CONFIG.BASE_URL}/genre/movie/list?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
            );
            const genresData = await genresResponse.json();
            const genresMap = genresData.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});

            const moviesWithLogos = await Promise.all(
                data.results.slice(0, 30).map(async (movie) => {
                    try {
                        const imagesResponse = await fetch(
                            `${TMDB_CONFIG.BASE_URL}/movie/${movie.id}/images?api_key=${TMDB_CONFIG.API_KEY}`
                        );
                        const imagesData = await imagesResponse.json();

                        const logo = imagesData.logos?.find(
                            (logo) =>
                                logo.iso_639_1 === "fr" ||
                                logo.iso_639_1 === "en" ||
                                logo.iso_639_1 === null
                        );

                        return {
                            ...movie,
                            genreNames: movie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: logo?.file_path || null,
                        };
                    } catch (error) {
                        console.error(
                            `Error fetching images for movie ${movie.id}:`,
                            error
                        );
                        return {
                            ...movie,
                            genreNames: movie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: null,
                        };
                    }
                })
            );

            return { results: moviesWithLogos };
        } catch (error) {
            console.error("Error fetching top rated movies:", error);
            return { results: [] };
        }
    },

    getImageUrl: (path, size = "w500") => {
        if (!path) return "/placeholder-movie.jpg";
        return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
    },
};
