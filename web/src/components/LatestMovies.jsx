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
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const isMobile = window.innerWidth < 768;
            const scrollDistance = isMobile ? 162 : 224;
            scrollContainerRef.current.scrollBy({
                left: -scrollDistance,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const isMobile = window.innerWidth < 768;
            const scrollDistance = isMobile ? 162 : 224;
            scrollContainerRef.current.scrollBy({
                left: scrollDistance,
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
        <section className="relative px-2 md:px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                    Derniers films
                </h2>
                <div className="flex gap-1 md:gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollLeft}
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-8 w-8 md:h-10 md:w-10"
                    >
                        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollRight}
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-8 w-8 md:h-10 md:w-10"
                    >
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-3 md:gap-6 overflow-x-auto pb-4 scrollbar-hide h-[350px] md:h-[450px]"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {loading
                    ? Array.from({ length: 12 }, (_, i) => (
                          <div key={i} className="flex-none">
                              <MovieCardSkeleton />
                          </div>
                      ))
                    : movies.map((movie) => (
                          <div key={movie.id} className="flex-none">
                              <MovieCard movie={movie} />
                          </div>
                      ))}
            </div>
        </section>
    );
}
