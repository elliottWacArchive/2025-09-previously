"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";

const MovieCard = ({ movie }) => {
    const titleLength = movie.title.length;
    let descriptionClass;

    if (titleLength > 35) {
        descriptionClass = "line-clamp-1";
    } else if (titleLength > 22) {
        descriptionClass = "line-clamp-2";
    } else {
        descriptionClass = "line-clamp-3";
    }

    const rating = movie.vote_average;
    let badgeColor;

    if (rating >= 7.5) {
        badgeColor = "bg-green-500/90";
    } else if (rating >= 5.0) {
        badgeColor = "bg-yellow-500/90";
    } else {
        badgeColor = "bg-red-500/90";
    }

    return (
        <div className="bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition-colors overflow-hidden group rounded-lg p-3 h-full flex flex-col">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg mb-3 flex-shrink-0">
                <img
                    src={tmdbApi.getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
                <div className="absolute top-2 right-2">
                    <Badge
                        variant="secondary"
                        className={`${badgeColor} text-white font-semibold flex items-center gap-1`}
                    >
                        <Star className="h-3 w-3 fill-current" />
                        {movie.vote_average.toFixed(1)}
                    </Badge>
                </div>
            </div>
            <div className="flex flex-col flex-1">
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                    {movie.title}
                </h3>
                <div className="flex justify-between items-center text-gray-400 text-[10px] mb-1">
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                    <span className="text-right truncate ml-2">
                        {movie.genreNames && movie.genreNames.length > 0
                            ? movie.genreNames[0]
                            : "Genre inconnu"}
                    </span>
                </div>
                <p
                    className={`text-gray-500 text-xs flex-1 ${descriptionClass}`}
                >
                    {movie.overview || "Aucun synopsis disponible."}
                </p>
            </div>
        </div>
    );
};

const MovieCardSkeleton = () => {
    return (
        <div className="bg-gray-900/50 border border-gray-800 overflow-hidden rounded-lg p-3 h-full flex flex-col">
            <div className="aspect-[2/3] mb-3">
                <Skeleton className="w-full h-full bg-gray-800 rounded-lg" />
            </div>
            <div className="flex-1 flex flex-col">
                <Skeleton className="h-4 w-3/4 mb-2 bg-gray-800" />
                <Skeleton className="h-3 w-1/2 mb-2 bg-gray-800" />
                <Skeleton className="h-3 w-full bg-gray-800 flex-1" />
            </div>
        </div>
    );
};

export default function LatestMovies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);

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
                setMovies(data.results?.slice(0, 12) || []);
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
        <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
                Dernières sorties cinéma
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
                                  className="flex-none w-48 snap-start"
                              >
                                  <div className="h-96">
                                      <MovieCardSkeleton />
                                  </div>
                              </div>
                          ))
                        : movies.map((movie) => (
                              <div
                                  key={movie.id}
                                  className="flex-none w-48 snap-start"
                              >
                                  <div className="h-96">
                                      <MovieCard movie={movie} />
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
}
