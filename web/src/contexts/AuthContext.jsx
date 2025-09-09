"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem("betaseries_token");
                const storedUser = localStorage.getItem("betaseries_user");

                if (token) {
                    if (storedUser) {
                        try {
                            const userData = JSON.parse(storedUser);
                            setUser(userData);
                        } catch (e) {
                            console.warn("Invalid stored user data");
                        }
                    }

                    try {
                        const response = await fetch(
                            "http://localhost:8080/api/v1/auth/me",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (response.ok) {
                            const userData = await response.json();
                            console.log("DEBUG: Received user data:", userData);
                            setUser(userData);
                            localStorage.setItem(
                                "betaseries_user",
                                JSON.stringify(userData)
                            );
                        } else {
                            clearAuthData();
                            setUser(null);
                        }
                    } catch (error) {
                        if (!storedUser) {
                            clearAuthData();
                            setUser(null);
                        }
                        console.warn(
                            "Network error during auth check, using cached data"
                        );
                    }
                } else {
                    clearAuthData();
                    setUser(null);
                }
            } catch (error) {
                console.error("Error initializing auth:", error);
                clearAuthData();
                setUser(null);
            }
            setLoading(false);
        };

        const clearAuthData = () => {
            localStorage.removeItem("betaseries_token");
            localStorage.removeItem("betaseries_user");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        };

        initAuth();
    }, []);

    const login = (userData, accessToken) => {
        console.log("DEBUG: Login called with userData:", userData);
        localStorage.setItem(
            "betaseries_token",
            accessToken || userData.accessToken
        );
        localStorage.setItem("betaseries_user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem("betaseries_token");
            if (token) {
                await fetch("http://localhost:8080/api/v1/auth/logout", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }

        localStorage.removeItem("betaseries_token");
        localStorage.removeItem("betaseries_user");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };

    const refreshAuthIfNeeded = async () => {
        const token = localStorage.getItem("betaseries_token");
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

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem(
                    "betaseries_user",
                    JSON.stringify(userData)
                );
                return true;
            } else {
                logout();
                return false;
            }
        } catch (error) {
            console.error("Error refreshing auth:", error);
            return false;
        }
    };

    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem("betaseries_token");
    };

    const getToken = () => {
        return localStorage.getItem("betaseries_token");
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        getToken,
        refreshAuthIfNeeded,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
