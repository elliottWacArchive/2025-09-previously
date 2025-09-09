"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

    useEffect(() => {
        const savedMovies = localStorage.getItem("watchlist-movies");
        const savedSeries = localStorage.getItem("watchlist-series");

        if (savedMovies) {
            try {
                setMovies(JSON.parse(savedMovies));
            } catch (error) {
                console.error("Error loading movies watchlist:", error);
            }
        }

        if (savedSeries) {
            try {
                setSeries(JSON.parse(savedSeries));
            } catch (error) {
                console.error("Error loading series watchlist:", error);
            }
        }
    }, []);

    const saveToLocalStorage = (type, data) => {
        localStorage.setItem(`watchlist-${type}`, JSON.stringify(data));
    };

    const addMovie = (movie) => {
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
    };

    const removeMovie = (movieId) => {
        setMovies((prevMovies) => {
            const updatedMovies = prevMovies.filter(
                (movie) => movie.id !== movieId
            );
            saveToLocalStorage("movies", updatedMovies);
            return updatedMovies;
        });
    };

    const addSerie = (serie) => {
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
    };

    const removeSerie = (serieId) => {
        setSeries((prevSeries) => {
            const updatedSeries = prevSeries.filter(
                (serie) => serie.id !== serieId
            );
            saveToLocalStorage("series", updatedSeries);
            return updatedSeries;
        });
    };

    const isMovieInWatchlist = (movieId) => {
        return movies.some((movie) => movie.id === movieId);
    };

    const isSerieInWatchlist = (serieId) => {
        return series.some((serie) => serie.id === serieId);
    };

    const toggleMovie = (movie) => {
        if (isMovieInWatchlist(movie.id)) {
            removeMovie(movie.id);
        } else {
            addMovie(movie);
        }
    };

    const toggleSerie = (serie) => {
        if (isSerieInWatchlist(serie.id)) {
            removeSerie(serie.id);
        } else {
            addSerie(serie);
        }
    };

    const value = {
        movies,
        series,
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
