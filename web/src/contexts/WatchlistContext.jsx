"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { watchlistApi } from "../lib/watchlistApi";

const WatchlistContext = createContext();

export const useWatchlist = () => {
    const context = useContext(WatchlistContext);
    if (!context) {
        throw new Error("useWatchlist must be used within a WatchlistProvider");
    }
    return context;
};

export const WatchlistProvider = ({ children }) => {
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuth();

    const formatApiItem = (apiItem) => {
        const itemData = apiItem.item_data || {};
        return {
            id: parseInt(apiItem.item_id),
            title: apiItem.title,
            name: apiItem.title,
            poster_path: apiItem.poster,
            release_date: apiItem.release_date,
            first_air_date: apiItem.release_date,
            overview: apiItem.overview,
            vote_average: apiItem.vote_average,
            genreNames: apiItem.genres || [],
            genre_names: apiItem.genres || [],
            media_type: apiItem.item_type === "serie" ? "tv" : "movie",
            ...itemData,
        };
    };

    useEffect(() => {
        const loadWatchlist = async () => {
            if (!isAuthenticated()) {
                const savedMovies = localStorage.getItem("watchlist-movies");
                const savedSeries = localStorage.getItem("watchlist-series");

                if (savedMovies) {
                    try {
                        setMovies(JSON.parse(savedMovies));
                    } catch (error) {
                        console.error(
                            "Error loading movies watchlist from localStorage:",
                            error
                        );
                    }
                }

                if (savedSeries) {
                    try {
                        setSeries(JSON.parse(savedSeries));
                    } catch (error) {
                        console.error(
                            "Error loading series watchlist from localStorage:",
                            error
                        );
                    }
                }
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [moviesData, seriesData] = await Promise.all([
                    watchlistApi.getWatchlist("movie"),
                    watchlistApi.getWatchlist("serie"),
                ]);

                const formattedMovies = moviesData.map(formatApiItem);
                const formattedSeries = seriesData.map(formatApiItem);

                setMovies(formattedMovies);
                setSeries(formattedSeries);

                localStorage.setItem(
                    "watchlist-movies",
                    JSON.stringify(formattedMovies)
                );
                localStorage.setItem(
                    "watchlist-series",
                    JSON.stringify(formattedSeries)
                );
            } catch (error) {
                console.error("Error loading watchlist from API:", error);
                const savedMovies = localStorage.getItem("watchlist-movies");
                const savedSeries = localStorage.getItem("watchlist-series");

                if (savedMovies) {
                    try {
                        setMovies(JSON.parse(savedMovies));
                    } catch (e) {
                        console.error(
                            "Error loading movies from localStorage:",
                            e
                        );
                    }
                }

                if (savedSeries) {
                    try {
                        setSeries(JSON.parse(savedSeries));
                    } catch (e) {
                        console.error(
                            "Error loading series from localStorage:",
                            e
                        );
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadWatchlist();
    }, [isAuthenticated, user]);

    const saveToLocalStorage = (type, data) => {
        localStorage.setItem(`watchlist-${type}`, JSON.stringify(data));
    };

    const addMovie = async (movie) => {
        try {
            if (isAuthenticated()) {
                await watchlistApi.addToWatchlist(movie);
            }

            setMovies((prevMovies) => {
                const isAlreadyInWatchlist = prevMovies.some(
                    (m) => m.id === movie.id
                );
                if (isAlreadyInWatchlist) {
                    return prevMovies;
                }

                const updatedMovies = [...prevMovies, movie];
                saveToLocalStorage("movies", updatedMovies);
                return updatedMovies;
            });
        } catch (error) {
            console.error("Error adding movie to watchlist:", error);
            setMovies((prevMovies) => {
                const isAlreadyInWatchlist = prevMovies.some(
                    (m) => m.id === movie.id
                );
                if (isAlreadyInWatchlist) {
                    return prevMovies;
                }

                const updatedMovies = [...prevMovies, movie];
                saveToLocalStorage("movies", updatedMovies);
                return updatedMovies;
            });
            throw error;
        }
    };

    const removeMovie = async (movieId) => {
        try {
            if (isAuthenticated()) {
                await watchlistApi.removeFromWatchlist(movieId, "movie");
            }

            setMovies((prevMovies) => {
                const updatedMovies = prevMovies.filter(
                    (movie) => movie.id !== movieId
                );
                saveToLocalStorage("movies", updatedMovies);
                return updatedMovies;
            });
        } catch (error) {
            console.error("Error removing movie from watchlist:", error);
            setMovies((prevMovies) => {
                const updatedMovies = prevMovies.filter(
                    (movie) => movie.id !== movieId
                );
                saveToLocalStorage("movies", updatedMovies);
                return updatedMovies;
            });
            throw error;
        }
    };

    const addSerie = async (serie) => {
        try {
            if (isAuthenticated()) {
                await watchlistApi.addToWatchlist(serie);
            }

            setSeries((prevSeries) => {
                const isAlreadyInWatchlist = prevSeries.some(
                    (s) => s.id === serie.id
                );
                if (isAlreadyInWatchlist) {
                    return prevSeries;
                }

                const updatedSeries = [...prevSeries, serie];
                saveToLocalStorage("series", updatedSeries);
                return updatedSeries;
            });
        } catch (error) {
            console.error("Error adding serie to watchlist:", error);
            setSeries((prevSeries) => {
                const isAlreadyInWatchlist = prevSeries.some(
                    (s) => s.id === serie.id
                );
                if (isAlreadyInWatchlist) {
                    return prevSeries;
                }

                const updatedSeries = [...prevSeries, serie];
                saveToLocalStorage("series", updatedSeries);
                return updatedSeries;
            });
            throw error;
        }
    };

    const removeSerie = async (serieId) => {
        try {
            if (isAuthenticated()) {
                await watchlistApi.removeFromWatchlist(serieId, "serie");
            }

            setSeries((prevSeries) => {
                const updatedSeries = prevSeries.filter(
                    (serie) => serie.id !== serieId
                );
                saveToLocalStorage("series", updatedSeries);
                return updatedSeries;
            });
        } catch (error) {
            console.error("Error removing serie from watchlist:", error);
            setSeries((prevSeries) => {
                const updatedSeries = prevSeries.filter(
                    (serie) => serie.id !== serieId
                );
                saveToLocalStorage("series", updatedSeries);
                return updatedSeries;
            });
            throw error;
        }
    };

    const isMovieInWatchlist = (movieId) => {
        return movies.some((movie) => movie.id === movieId);
    };

    const isSerieInWatchlist = (serieId) => {
        return series.some((serie) => serie.id === serieId);
    };

    const toggleMovie = async (movie) => {
        if (isMovieInWatchlist(movie.id)) {
            await removeMovie(movie.id);
        } else {
            await addMovie(movie);
        }
    };

    const toggleSerie = async (serie) => {
        if (isSerieInWatchlist(serie.id)) {
            await removeSerie(serie.id);
        } else {
            await addSerie(serie);
        }
    };

    const value = {
        movies,
        series,
        loading,
        addMovie,
        removeMovie,
        addSerie,
        removeSerie,
        isMovieInWatchlist,
        isSerieInWatchlist,
        toggleMovie,
        toggleSerie,
    };

    return (
        <WatchlistContext.Provider value={value}>
            {children}
        </WatchlistContext.Provider>
    );
};
