"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Clock, ArrowLeft } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import { Skeleton } from "@/components/ui/skeleton";

export default function MovieDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                const movieDetails = await tmdbApi.getMovieDetails(params.id);
                setMovie(movieDetails);
            } catch (error) {
                console.error("Error fetching movie details:", error);
                setError("Impossible de charger les détails du film");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchMovieDetails();
        }
    }, [params.id]);

    const formatRuntime = (minutes) => {
        if (!minutes) return "Durée inconnue";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    const formatCurrency = (amount) => {
        if (!amount) return "Non communiqué";
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        })
            .format(amount)
            .replace("$US", "$");
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-black">
                    <Header />
                    <div className="relative">
                        <Skeleton className="w-full h-96 bg-gray-800" />
                        <div className="max-w-7xl mx-auto px-4 py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1">
                                    <Skeleton className="w-full aspect-[2/3] bg-gray-800 rounded-lg" />
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                    <Skeleton className="h-12 w-3/4 bg-gray-800" />
                                    <Skeleton className="h-6 w-1/2 bg-gray-800" />
                                    <Skeleton className="h-24 w-full bg-gray-800" />
                                    <Skeleton className="h-32 w-full bg-gray-800" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-black">
                    <Header />
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="text-center">
                            <p className="text-red-400 text-xl mb-4">{error}</p>
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!movie) return null;

    const director = movie.credits?.crew?.find(
        (person) => person.job === "Director"
    );
    const mainCast = movie.credits?.cast?.slice(0, 8) || [];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black">
                <Header />

                <div className="relative">
                    {movie.backdrop_path && (
                        <>
                            <div className="w-full h-96 relative">
                                <img
                                    src={tmdbApi.getImageUrl(
                                        movie.backdrop_path,
                                        "w1280"
                                    )}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                            </div>
                        </>
                    )}

                    <div className="absolute top-4 left-4 z-10">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="bg-black/60 border-gray-600 text-white hover:bg-black/80"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 -mt-32 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <img
                                    src={
                                        movie.poster_path
                                            ? tmdbApi.getImageUrl(
                                                  movie.poster_path,
                                                  "w500"
                                              )
                                            : "/placeholder-movie.jpg"
                                    }
                                    alt={movie.title}
                                    className="w-full rounded-lg shadow-2xl"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    {movie.title}
                                </h1>
                                {movie.tagline && (
                                    <p className="text-xl text-gray-300 italic mb-4">
                                        "{movie.tagline}"
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 items-center">
                                    {(() => {
                                        const rating = movie.vote_average || 0;
                                        let badgeColor;

                                        if (rating >= 7.5) {
                                            badgeColor = "bg-green-500/90";
                                        } else if (rating >= 5.0) {
                                            badgeColor = "bg-yellow-500/90";
                                        } else {
                                            badgeColor = "bg-red-500/90";
                                        }

                                        return (
                                            <Badge
                                                className={`${badgeColor} text-white font-semibold flex items-center gap-1`}
                                            >
                                                <Star className="h-4 w-4 fill-current" />
                                                {rating.toFixed(1)}/10
                                            </Badge>
                                        );
                                    })()}
                                    <Badge
                                        variant="outline"
                                        className="border-gray-600 text-gray-300"
                                    >
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {movie.release_date
                                            ? new Date(
                                                  movie.release_date
                                              ).getFullYear()
                                            : "Année inconnue"}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-gray-600 text-gray-300"
                                    >
                                        <Clock className="h-4 w-4 mr-1" />
                                        {formatRuntime(movie.runtime)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Genres */}
                            {movie.genres && movie.genres.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Genres
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.map((genre) => (
                                            <Badge
                                                key={genre.id}
                                                variant="secondary"
                                                className="bg-red-600/20 text-red-300 border-red-600/30"
                                            >
                                                {genre.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    Synopsis
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {movie.overview ||
                                        "Aucun synopsis disponible."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">
                                        Informations
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {director && (
                                            <div>
                                                <span className="text-gray-400">
                                                    Réalisateur:
                                                </span>
                                                <span className="text-white ml-2">
                                                    {director.name}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-400">
                                                Budget:
                                            </span>
                                            <span className="text-white ml-2">
                                                {formatCurrency(movie.budget)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">
                                                Recettes:
                                            </span>
                                            <span className="text-white ml-2">
                                                {formatCurrency(movie.revenue)}
                                            </span>
                                        </div>
                                        {movie.production_companies &&
                                            movie.production_companies.length >
                                                0 && (
                                                <div>
                                                    <span className="text-gray-400">
                                                        Production:
                                                    </span>
                                                    <span className="text-white ml-2">
                                                        {movie.production_companies
                                                            .slice(0, 2)
                                                            .map(
                                                                (company) =>
                                                                    company.name
                                                            )
                                                            .join(", ")}
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {mainCast.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">
                                        Acteurs principaux
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {mainCast.map((actor) => (
                                            <div
                                                key={actor.id}
                                                className="text-center"
                                            >
                                                <div className="aspect-[2/3] mb-2 bg-gray-800 rounded-lg overflow-hidden">
                                                    {actor.profile_path ? (
                                                        <img
                                                            src={tmdbApi.getImageUrl(
                                                                actor.profile_path,
                                                                "w185"
                                                            )}
                                                            alt={actor.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                            <span className="text-xs">
                                                                Pas de photo
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-white text-sm font-medium">
                                                    {actor.name}
                                                </p>
                                                <p className="text-gray-400 text-xs">
                                                    {actor.character}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
