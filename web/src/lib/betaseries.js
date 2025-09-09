export const BETASERIES_CONFIG = {
    BASE_URL: "https://api.betaseries.com",
    API_KEY: process.env.NEXT_PUBLIC_BETASERIES_API_KEY || "dd6939704484",
    CLIENT_ID: process.env.NEXT_PUBLIC_BETASERIES_CLIENT_ID || "your_client_id",
    CLIENT_SECRET: process.env.BETASERIES_CLIENT_SECRET || "your_client_secret",
    REDIRECT_URI: process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
        : "http://localhost:3000/auth/callback",
    SCOPE: "read+write",
};

const generateState = () => {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
};

const apiCall = async (endpoint, options = {}) => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("betaseries_token")
            : null;
    const headers = {
        "X-BetaSeries-Key": BETASERIES_CONFIG.API_KEY,
        ...options.headers,
    };

    if (token) {
        headers["X-BetaSeries-Token"] = token;
    }

    const response = await fetch(`${BETASERIES_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("betaseries_token");
            localStorage.removeItem("betaseries_user");
            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/"
            ) {
                window.location.href = "/login";
            }
        }
        throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
};

export const betaseriesAuth = {
    getAuthUrl: () => {
        const state = generateState();
        if (typeof window !== "undefined") {
            localStorage.setItem("oauth_state", state);
        }

        const params = new URLSearchParams({
            client_id: BETASERIES_CONFIG.CLIENT_ID,
            redirect_uri: BETASERIES_CONFIG.REDIRECT_URI,
            response_type: "code",
            state: state,
        });
        return `${
            BETASERIES_CONFIG.BASE_URL
        }/oauth/authorize?${params.toString()}`;
    },

    exchangeCodeForToken: async (code) => {
        try {
            const response = await fetch(
                `${BETASERIES_CONFIG.BASE_URL}/oauth/access_token`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-BetaSeries-Key": BETASERIES_CONFIG.API_KEY,
                    },
                    body: new URLSearchParams({
                        client_id: BETASERIES_CONFIG.CLIENT_ID,
                        client_secret: BETASERIES_CONFIG.CLIENT_SECRET,
                        redirect_uri: BETASERIES_CONFIG.REDIRECT_URI,
                        grant_type: "authorization_code",
                        code: code,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to exchange code for token");
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error("Error exchanging code for token:", error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const data = await apiCall("/members/infos");
            return data.member;
        } catch (error) {
            console.error("Error fetching current user:", error);
            throw error;
        }
    },

    storeAuthData: (token, user) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("betaseries_token", token);
            localStorage.setItem("betaseries_user", JSON.stringify(user));
        }
    },

    getStoredAuthData: () => {
        if (typeof window === "undefined") return { token: null, user: null };

        const token = localStorage.getItem("betaseries_token");
        const userStr = localStorage.getItem("betaseries_user");
        const user = userStr ? JSON.parse(userStr) : null;
        return { token, user };
    },

    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("betaseries_token");
            localStorage.removeItem("betaseries_user");
            localStorage.removeItem("oauth_state");
        }
    },

    isAuthenticated: async () => {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("betaseries_token")
                : null;

        if (!token) return false;

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.ok;
        } catch (error) {
            console.error("Error checking authentication:", error);
            return false;
        }
    },

    refreshUserData: async () => {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("betaseries_token")
                : null;

        if (!token) return null;

        try {
            const user = await betaseriesAuth.getCurrentUser();
            if (typeof window !== "undefined") {
                localStorage.setItem("betaseries_user", JSON.stringify(user));
            }
            return user;
        } catch (error) {
            console.error("Error refreshing user data:", error);
            betaseriesAuth.logout();
            return null;
        }
    },
};

export const betaseriesApi = {
    searchSeries: async (query) => {
        try {
            const data = await apiCall(
                `/shows/search?title=${encodeURIComponent(query)}`
            );
            return data.shows || [];
        } catch (error) {
            console.error("Error searching series:", error);
            return [];
        }
    },

    getSeriesDetails: async (seriesId) => {
        try {
            const data = await apiCall(`/shows/display?id=${seriesId}`);
            return data.show;
        } catch (error) {
            console.error("Error fetching series details:", error);
            throw error;
        }
    },

    getUserSeries: async () => {
        try {
            const data = await apiCall("/shows/member");
            return data.shows || [];
        } catch (error) {
            console.error("Error fetching user series:", error);
            return [];
        }
    },

    addSeriesToCollection: async (seriesId) => {
        try {
            const data = await apiCall(`/shows/show`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ id: seriesId }),
            });
            return data;
        } catch (error) {
            console.error("Error adding series to collection:", error);
            throw error;
        }
    },

    removeSeriesFromCollection: async (seriesId) => {
        try {
            const data = await apiCall(`/shows/show`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ id: seriesId }),
            });
            return data;
        } catch (error) {
            console.error("Error removing series from collection:", error);
            throw error;
        }
    },

    searchMovies: async (query) => {
        try {
            const data = await apiCall(
                `/movies/search?title=${encodeURIComponent(query)}`
            );
            return data.movies || [];
        } catch (error) {
            console.error("Error searching movies:", error);
            return [];
        }
    },

    getMovieDetails: async (movieId) => {
        try {
            const data = await apiCall(`/movies/movie?id=${movieId}`);
            return data.movie;
        } catch (error) {
            console.error("Error fetching movie details:", error);
            throw error;
        }
    },

    getUserMovies: async () => {
        try {
            const data = await apiCall("/movies/member");
            return data.movies || [];
        } catch (error) {
            console.error("Error fetching user movies:", error);
            return [];
        }
    },

    addMovieToCollection: async (movieId, state = 1) => {
        try {
            const data = await apiCall(`/movies/movie`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    id: movieId,
                    state: state,
                }),
            });
            return data;
        } catch (error) {
            console.error("Error adding movie to collection:", error);
            throw error;
        }
    },

    removeMovieFromCollection: async (movieId) => {
        try {
            const data = await apiCall(`/movies/movie`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ id: movieId }),
            });
            return data;
        } catch (error) {
            console.error("Error removing movie from collection:", error);
            throw error;
        }
    },

    getDiscoverSeries: async (type = "popularity") => {
        try {
            const data = await apiCall(`/shows/discover?order=${type}`);
            return data.shows || [];
        } catch (error) {
            console.error("Error fetching discover series:", error);
            return [];
        }
    },

    getDiscoverMovies: async (type = "popularity") => {
        try {
            const data = await apiCall(`/movies/discover?order=${type}`);
            return data.movies || [];
        } catch (error) {
            console.error("Error fetching discover movies:", error);
            return [];
        }
    },

    getSeriesDetailsByName: async (seriesName) => {
        try {
            const searchResults = await betaseriesApi.searchSeries(seriesName);
            if (searchResults.length === 0) {
                throw new Error("Series not found");
            }

            const firstResult = searchResults[0];
            return await betaseriesApi.getSeriesDetails(firstResult.id);
        } catch (error) {
            console.error("Error fetching series details by name:", error);
            throw error;
        }
    },
};

export const getSeriesDetailsForTMDBSerie = async (tmdbSerie) => {
    try {
        const seriesName = tmdbSerie.name || tmdbSerie.title;
        const betaseriesDetails = await betaseriesApi.getSeriesDetailsByName(
            seriesName
        );

        return {
            tmdb: tmdbSerie,
            betaseries: betaseriesDetails,
        };
    } catch (error) {
        console.error("Error converting TMDB serie to Betaseries:", error);
        return {
            tmdb: tmdbSerie,
            betaseries: null,
        };
    }
};
