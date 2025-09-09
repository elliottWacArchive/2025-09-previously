"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";

export default function LatestMovies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openOverlayId, setOpenOverlayId] = useState(null);
    const scrollContainerRef = useRef(null);

    const handleCardClick = (movieId) => {
        setOpenOverlayId(movieId);
    };

    const handleOverlayClose = () => {
        setOpenOverlayId(null);
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -200,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 200,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getLatestReleases();
                const sortedMovies = (data.results || [])
                    .sort((a, b) => b.vote_average - a.vote_average)
                    .slice(0, 12);
                setMovies(sortedMovies);
            } catch (err) {
                setError("Erreur lors du chargement des films");
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <section className="relative">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                    Dernières sorties cinéma
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollLeft}
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollRight}
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {loading
                    ? Array.from({ length: 12 }, (_, i) => (
                          <div key={i} className="flex-none w-72 h-72">
                              <MovieCardSkeleton />
                          </div>
                      ))
                    : movies.map((movie) => (
                          <div key={movie.id} className="flex-none w-72 h-72">
                              <MovieCard
                                  movie={movie}
                                  isOverlayOpen={openOverlayId === movie.id}
                                  onCardClick={handleCardClick}
                                  onOverlayClose={handleOverlayClose}
                              />
                          </div>
                      ))}
            </div>
        </section>
    );
}
