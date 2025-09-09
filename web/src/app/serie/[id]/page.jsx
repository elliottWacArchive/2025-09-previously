"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Tv, ArrowLeft } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import { getSeriesDetailsForTMDBSerie } from "@/lib/betaseries";
import { Skeleton } from "@/components/ui/skeleton";

export default function SerieDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [serie, setSerie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSerieDetails = async () => {
            try {
                setLoading(true);
                const tmdbDetails = await tmdbApi.getSeriesDetails(params.id);

                const combinedDetails = await getSeriesDetailsForTMDBSerie(
                    tmdbDetails
                );
                setSerie(combinedDetails);
            } catch (error) {
                console.error("Error fetching serie details:", error);
                setError("Impossible de charger les détails de la série");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchSerieDetails();
        }
    }, [params.id]);

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

    if (!serie) return null;

    const tmdbData = serie.tmdb;
    const betaseriesData = serie.betaseries;

    const title = betaseriesData?.title || tmdbData.name || tmdbData.title;
    const description = betaseriesData?.description || tmdbData.overview;
    const numberOfSeasons = tmdbData.number_of_seasons;
    const numberOfEpisodes =
        tmdbData.number_of_episodes || betaseriesData?.episodes;
    const firstAirDate = tmdbData.first_air_date;
    const status = betaseriesData?.status || tmdbData.status;
    const network = tmdbData.networks?.[0]?.name;
    const rating = tmdbData.vote_average;
    const genres = tmdbData.genres || [];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black">
                <Header />

                <div className="relative">
                    {tmdbData.backdrop_path && (
                        <>
                            <div className="w-full h-96 relative">
                                <img
                                    src={tmdbApi.getImageUrl(
                                        tmdbData.backdrop_path,
                                        "w1280"
                                    )}
                                    alt={title}
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
                                        tmdbData.poster_path
                                            ? tmdbApi.getImageUrl(
                                                  tmdbData.poster_path,
                                                  "w500"
                                              )
                                            : "/placeholder-movie.jpg"
                                    }
                                    alt={title}
                                    className="w-full rounded-lg shadow-2xl"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    {title}
                                </h1>
                                {betaseriesData?.description && (
                                    <p className="text-xl text-gray-300 italic mb-4">
                                        Serie référencée sur Betaseries
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 items-center">
                                    <Badge className="bg-yellow-600 text-white flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-current" />
                                        {rating?.toFixed(1) || "N/A"}/10
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-gray-600 text-gray-300"
                                    >
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {firstAirDate
                                            ? new Date(
                                                  firstAirDate
                                              ).getFullYear()
                                            : "Année inconnue"}
                                    </Badge>
                                    {numberOfSeasons && (
                                        <Badge
                                            variant="outline"
                                            className="border-gray-600 text-gray-300"
                                        >
                                            <Tv className="h-4 w-4 mr-1" />
                                            {numberOfSeasons} saison
                                            {numberOfSeasons > 1 ? "s" : ""}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {genres.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Genres
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map((genre) => (
                                            <Badge
                                                key={genre.id}
                                                variant="secondary"
                                                className="bg-blue-600/20 text-blue-300 border-blue-600/30"
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
                                    {description ||
                                        "Aucun synopsis disponible."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">
                                        Informations
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-400">
                                                Statut:
                                            </span>
                                            <span className="text-white ml-2">
                                                {status || "Inconnu"}
                                            </span>
                                        </div>
                                        {network && (
                                            <div>
                                                <span className="text-gray-400">
                                                    Chaîne:
                                                </span>
                                                <span className="text-white ml-2">
                                                    {network}
                                                </span>
                                            </div>
                                        )}
                                        {numberOfEpisodes && (
                                            <div>
                                                <span className="text-gray-400">
                                                    Nombre d'épisodes:
                                                </span>
                                                <span className="text-white ml-2">
                                                    {numberOfEpisodes}
                                                </span>
                                            </div>
                                        )}
                                        {tmdbData.episode_run_time &&
                                            tmdbData.episode_run_time.length >
                                                0 && (
                                                <div>
                                                    <span className="text-gray-400">
                                                        Durée par épisode:
                                                    </span>
                                                    <span className="text-white ml-2">
                                                        {
                                                            tmdbData
                                                                .episode_run_time[0]
                                                        }{" "}
                                                        min
                                                    </span>
                                                </div>
                                            )}
                                        {tmdbData.production_companies &&
                                            tmdbData.production_companies
                                                .length > 0 && (
                                                <div>
                                                    <span className="text-gray-400">
                                                        Production:
                                                    </span>
                                                    <span className="text-white ml-2">
                                                        {tmdbData.production_companies
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

                                {betaseriesData && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">
                                            Betaseries
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            {betaseriesData.language && (
                                                <div>
                                                    <span className="text-gray-400">
                                                        Langue:
                                                    </span>
                                                    <span className="text-white ml-2">
                                                        {
                                                            betaseriesData.language
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {betaseriesData.country && (
                                                <div>
                                                    <span className="text-gray-400">
                                                        Pays:
                                                    </span>
                                                    <span className="text-white ml-2">
                                                        {betaseriesData.country}
                                                    </span>
                                                </div>
                                            )}
                                            {betaseriesData.creation && (
                                                <div>
                                                    <span className="text-gray-400">
                                                        Créateurs:
                                                    </span>
                                                    <span className="text-white ml-2">
                                                        {
                                                            betaseriesData.creation
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {tmdbData.credits &&
                                tmdbData.credits.cast &&
                                tmdbData.credits.cast.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4">
                                            Acteurs principaux
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {tmdbData.credits.cast
                                                .slice(0, 8)
                                                .map((actor) => (
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
                                                                    alt={
                                                                        actor.name
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                    <span className="text-xs">
                                                                        Pas de
                                                                        photo
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
