"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";

export default function TopRatedMovies() {
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
        const fetchTopRatedMovies = async () => {
            try {
                setLoading(true);

                const [page1, page2] = await Promise.all([
                    tmdbApi.getTopRated(1),
                    tmdbApi.getTopRated(2),
                ]);

                const allMovies = [
                    ...(page1.results || []),
                    ...(page2.results || []),
                ];

                const topRatedMovies = allMovies
                    .filter(
                        (movie) =>
                            movie.vote_average > 0 && movie.vote_count > 100
                    )
                    .sort((a, b) => b.vote_average - a.vote_average)
                    .slice(0, 30);

                setMovies(topRatedMovies);
            } catch (err) {
                console.error(
                    "Erreur lors du chargement des films les mieux notés:",
                    err
                );
                setError("Erreur lors du chargement des films les mieux notés");
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedMovies();
    }, []);

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
                Films les mieux notés
            </h2>
            <div className="relative">
                <Button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 border-0 h-12 w-12 rounded-full p-0"
                    size="sm"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </Button>

                <Button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 border-0 h-12 w-12 rounded-full p-0"
                    size="sm"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </Button>

                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-8"
                >
                    {loading
                        ? Array.from({ length: 12 }, (_, i) => (
                              <div
                                  key={i}
                                  className="flex-none w-80 snap-start"
                              >
                                  <div className="h-96">
                                      <MovieCardSkeleton />
                                  </div>
                              </div>
                          ))
                        : movies.map((movie) => (
                              <div
                                  key={movie.id}
                                  className="flex-none w-80 snap-start"
                              >
                                  <div className="h-96">
                                      <MovieCard
                                          movie={movie}
                                          isOverlayOpen={
                                              openOverlayId === movie.id
                                          }
                                          onCardClick={handleCardClick}
                                          onOverlayClose={handleOverlayClose}
                                      />
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
}
