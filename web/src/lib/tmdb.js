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
    enrichMovieWithImages: async (movieId) => {
        try {
            const [detailsResponse, imagesResponse] = await Promise.all([
                fetch(
                    `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                ),
                fetch(
                    `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/images?api_key=${TMDB_CONFIG.API_KEY}`
                ),
            ]);

            if (!detailsResponse.ok || !imagesResponse.ok) {
                throw new Error("Failed to fetch movie details");
            }

            const [details, images] = await Promise.all([
                detailsResponse.json(),
                imagesResponse.json(),
            ]);

            const logo = images.logos?.find(
                (logo) =>
                    logo.iso_639_1 === "fr" ||
                    logo.iso_639_1 === "en" ||
                    logo.iso_639_1 === null
            );

            return {
                backdrop_path: details.backdrop_path,
                logo_path: logo?.file_path || null,
            };
        } catch (error) {
            console.error("Error enriching movie with images:", error);
            return {
                backdrop_path: null,
                logo_path: null,
            };
        }
    },

    enrichSerieWithImages: async (serieId) => {
        try {
            const [detailsResponse, imagesResponse] = await Promise.all([
                fetch(
                    `${TMDB_CONFIG.BASE_URL}/tv/${serieId}?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                ),
                fetch(
                    `${TMDB_CONFIG.BASE_URL}/tv/${serieId}/images?api_key=${TMDB_CONFIG.API_KEY}`
                ),
            ]);

            if (!detailsResponse.ok || !imagesResponse.ok) {
                throw new Error("Failed to fetch serie details");
            }

            const [details, images] = await Promise.all([
                detailsResponse.json(),
                imagesResponse.json(),
            ]);

            const logo = images.logos?.find(
                (logo) =>
                    logo.iso_639_1 === "fr" ||
                    logo.iso_639_1 === "en" ||
                    logo.iso_639_1 === null
            );

            return {
                backdrop_path: details.backdrop_path,
                logo_path: logo?.file_path || null,
            };
        } catch (error) {
            console.error("Error enriching serie with images:", error);
            return {
                backdrop_path: null,
                logo_path: null,
            };
        }
    },

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

    getLatestSeries: async () => {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/tv/on_the_air?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR&page=1`
            );
            if (!response.ok) throw new Error("Failed to fetch series");
            const data = await response.json();

            const genresResponse = await fetch(
                `${TMDB_CONFIG.BASE_URL}/genre/tv/list?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
            );
            const genresData = await genresResponse.json();
            const genresMap = genresData.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});

            const seriesWithDetails = await Promise.all(
                data.results.map(async (serie) => {
                    try {
                        const detailsResponse = await fetch(
                            `${TMDB_CONFIG.BASE_URL}/tv/${serie.id}?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                        );
                        const detailsData = await detailsResponse.json();

                        const imagesResponse = await fetch(
                            `${TMDB_CONFIG.BASE_URL}/tv/${serie.id}/images?api_key=${TMDB_CONFIG.API_KEY}`
                        );
                        const imagesData = await imagesResponse.json();

                        const logo = imagesData.logos?.find(
                            (logo) =>
                                logo.iso_639_1 === "fr" ||
                                logo.iso_639_1 === "en" ||
                                logo.iso_639_1 === null
                        );

                        return {
                            ...serie,
                            number_of_seasons: detailsData.number_of_seasons,
                            genreNames: serie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: logo?.file_path || null,
                        };
                    } catch (error) {
                        console.error(
                            `Error fetching details for series ${serie.id}:`,
                            error
                        );
                        return {
                            ...serie,
                            number_of_seasons: null,
                            genreNames: serie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: null,
                        };
                    }
                })
            );

            return { ...data, results: seriesWithDetails };
        } catch (error) {
            console.error("Error fetching latest series:", error);
            return { results: [] };
        }
    },

    getTopRatedSeries: async (page = 1) => {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.BASE_URL}/tv/top_rated?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR&page=${page}`
            );
            if (!response.ok)
                throw new Error("Failed to fetch top rated series");
            const data = await response.json();

            const genresResponse = await fetch(
                `${TMDB_CONFIG.BASE_URL}/genre/tv/list?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
            );
            const genresData = await genresResponse.json();
            const genresMap = genresData.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});

            const seriesWithDetails = await Promise.all(
                data.results.slice(0, 30).map(async (serie) => {
                    try {
                        const detailsResponse = await fetch(
                            `${TMDB_CONFIG.BASE_URL}/tv/${serie.id}?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                        );
                        const detailsData = await detailsResponse.json();

                        const imagesResponse = await fetch(
                            `${TMDB_CONFIG.BASE_URL}/tv/${serie.id}/images?api_key=${TMDB_CONFIG.API_KEY}`
                        );
                        const imagesData = await imagesResponse.json();

                        const logo = imagesData.logos?.find(
                            (logo) =>
                                logo.iso_639_1 === "fr" ||
                                logo.iso_639_1 === "en" ||
                                logo.iso_639_1 === null
                        );

                        return {
                            ...serie,
                            number_of_seasons: detailsData.number_of_seasons,
                            genreNames: serie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: logo?.file_path || null,
                        };
                    } catch (error) {
                        console.error(
                            `Error fetching details for series ${serie.id}:`,
                            error
                        );
                        return {
                            ...serie,
                            number_of_seasons: null,
                            genreNames: serie.genre_ids
                                .map((id) => genresMap[id])
                                .filter(Boolean),
                            logo_path: null,
                        };
                    }
                })
            );

            return { results: seriesWithDetails };
        } catch (error) {
            console.error("Error fetching top rated series:", error);
            return { results: [] };
        }
    },

    getMovieDetails: async (movieId) => {
        try {
            const [detailsResponse, creditsResponse, imagesResponse] =
                await Promise.all([
                    fetch(
                        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                    ),
                    fetch(
                        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                    ),
                    fetch(
                        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/images?api_key=${TMDB_CONFIG.API_KEY}`
                    ),
                ]);

            if (
                !detailsResponse.ok ||
                !creditsResponse.ok ||
                !imagesResponse.ok
            ) {
                throw new Error("Failed to fetch movie details");
            }

            const [details, credits, images] = await Promise.all([
                detailsResponse.json(),
                creditsResponse.json(),
                imagesResponse.json(),
            ]);

            const logo = images.logos?.find(
                (logo) =>
                    logo.iso_639_1 === "fr" ||
                    logo.iso_639_1 === "en" ||
                    logo.iso_639_1 === null
            );

            return {
                ...details,
                credits: credits,
                logo_path: logo?.file_path || null,
            };
        } catch (error) {
            console.error("Error fetching movie details:", error);
            throw error;
        }
    },

    getSeriesDetails: async (seriesId) => {
        try {
            const [detailsResponse, creditsResponse, imagesResponse] =
                await Promise.all([
                    fetch(
                        `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                    ),
                    fetch(
                        `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}/credits?api_key=${TMDB_CONFIG.API_KEY}&language=fr-FR`
                    ),
                    fetch(
                        `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}/images?api_key=${TMDB_CONFIG.API_KEY}`
                    ),
                ]);

            if (
                !detailsResponse.ok ||
                !creditsResponse.ok ||
                !imagesResponse.ok
            ) {
                throw new Error("Failed to fetch series details");
            }

            const [details, credits, images] = await Promise.all([
                detailsResponse.json(),
                creditsResponse.json(),
                imagesResponse.json(),
            ]);

            const logo = images.logos?.find(
                (logo) =>
                    logo.iso_639_1 === "fr" ||
                    logo.iso_639_1 === "en" ||
                    logo.iso_639_1 === null
            );

            return {
                ...details,
                credits: credits,
                logo_path: logo?.file_path || null,
            };
        } catch (error) {
            console.error("Error fetching series details:", error);
            throw error;
        }
    },

    getImageUrl: (path, size = "w500") => {
        if (!path) return "/placeholder-movie.jpg";
        return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
    },
};
