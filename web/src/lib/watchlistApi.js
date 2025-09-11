const API_BASE_URL = "http://localhost:8080/api/v1";

const getAuthHeaders = () => {
    const token = localStorage.getItem("betaseries_token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const watchlistApi = {
    getWatchlist: async (type = "") => {
        try {
            const url = type
                ? `${API_BASE_URL}/watchlist?type=${type}`
                : `${API_BASE_URL}/watchlist`;

            const response = await fetch(url, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.watchlist || [];
        } catch (error) {
            console.error("Error fetching watchlist:", error);
            throw error;
        }
    },

    addToWatchlist: async (item) => {
        try {
            const response = await fetch(`${API_BASE_URL}/watchlist`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    item_id: String(item.id),
                    item_type:
                        item.media_type ||
                        (item.first_air_date ? "serie" : "movie"),
                    title: item.title || item.name,
                    poster: item.poster_path,
                    release_date: item.release_date || item.first_air_date,
                    overview: item.overview,
                    vote_average: item.vote_average,
                    genres: item.genreNames || item.genre_names || [],
                    item_data: item,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorData}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            throw error;
        }
    },

    removeFromWatchlist: async (itemId, itemType = "") => {
        try {
            const url = itemType
                ? `${API_BASE_URL}/watchlist/${itemId}?type=${itemType}`
                : `${API_BASE_URL}/watchlist/${itemId}`;

            const response = await fetch(url, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorData}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            throw error;
        }
    },

    checkWatchlistStatus: async (itemId, itemType = "") => {
        try {
            const url = itemType
                ? `${API_BASE_URL}/watchlist/check/${itemId}?type=${itemType}`
                : `${API_BASE_URL}/watchlist/check/${itemId}`;

            const response = await fetch(url, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.in_watchlist;
        } catch (error) {
            console.error("Error checking watchlist status:", error);
            return false;
        }
    },
};
