export const PERSISTENCE_CONFIG = {
    TOKEN_CHECK_INTERVAL: 5 * 60 * 1000,

    TOKEN_REFRESH_BUFFER: 10 * 60 * 1000,

    MAX_REFRESH_ATTEMPTS: 3,

    REFRESH_RETRY_DELAY: 1000,

    STORAGE_KEYS: {
        TOKEN: "betaseries_token",
        USER: "betaseries_user",
        REFRESH_TOKEN: "betaseries_refresh_token",
        TOKEN_EXPIRES: "betaseries_token_expires",
        OAUTH_STATE: "oauth_state",
    },

    API_ENDPOINTS: {
        BASE_URL: "http://localhost:8080/api/v1",
        AUTH_ME: "/auth/me",
        AUTH_LOGOUT: "/auth/logout",
        AUTH_REFRESH: "/auth/refresh",
    },
};

export const storageUtils = {
    saveAuthData: (token, user, refreshToken = null, expiresAt = null) => {
        if (typeof window === "undefined") return;

        localStorage.setItem(PERSISTENCE_CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(
            PERSISTENCE_CONFIG.STORAGE_KEYS.USER,
            JSON.stringify(user)
        );

        if (refreshToken) {
            localStorage.setItem(
                PERSISTENCE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
                refreshToken
            );
        }

        if (expiresAt) {
            localStorage.setItem(
                PERSISTENCE_CONFIG.STORAGE_KEYS.TOKEN_EXPIRES,
                expiresAt.toISOString()
            );
        }
    },

    getAuthData: () => {
        if (typeof window === "undefined") return null;

        const token = localStorage.getItem(
            PERSISTENCE_CONFIG.STORAGE_KEYS.TOKEN
        );
        const userStr = localStorage.getItem(
            PERSISTENCE_CONFIG.STORAGE_KEYS.USER
        );
        const refreshToken = localStorage.getItem(
            PERSISTENCE_CONFIG.STORAGE_KEYS.REFRESH_TOKEN
        );
        const expiresStr = localStorage.getItem(
            PERSISTENCE_CONFIG.STORAGE_KEYS.TOKEN_EXPIRES
        );

        if (!token) return null;

        const user = userStr ? JSON.parse(userStr) : null;
        const expiresAt = expiresStr ? new Date(expiresStr) : null;

        return {
            token,
            user,
            refreshToken,
            expiresAt,
        };
    },

    isTokenNearExpiry: (expiresAt) => {
        if (!expiresAt) return false;
        const now = new Date();
        const bufferTime = new Date(
            expiresAt.getTime() - PERSISTENCE_CONFIG.TOKEN_REFRESH_BUFFER
        );
        return now >= bufferTime;
    },

    clearAuthData: () => {
        if (typeof window === "undefined") return;

        Object.values(PERSISTENCE_CONFIG.STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    isAuthenticated: () => {
        const authData = storageUtils.getAuthData();
        if (!authData) return false;

        if (authData.expiresAt && new Date() > authData.expiresAt) {
            return false;
        }

        return true;
    },
};
