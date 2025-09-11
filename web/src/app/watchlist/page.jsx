"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { useWatchlist } from "@/contexts/WatchlistContext";
import {
    WatchlistMovieCard,
    WatchlistSerieCard,
} from "@/components/WatchlistCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WatchlistPage() {
    const { movies, series, removeMovie, removeSerie, loading } =
        useWatchlist();

    const hasMovies = movies.length > 0;
    const hasSeries = series.length > 0;
    const hasAnyContent = hasMovies || hasSeries;

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-black">
                    <Header />
                    <div className="p-2 md:p-4">
                        <div className="max-w-7xl mx-auto pt-4 md:pt-8">
                            <div className="mb-6 md:mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    Ma Watchlist
                                </h1>
                                <p className="text-gray-400">
                                    Chargement de votre watchlist...
                                </p>
                            </div>
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const EmptyState = ({ type }) => (
        <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500/20 to-red-300/20 rounded-full flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    Aucun {type} dans votre watchlist
                </h3>
                <p className="text-gray-400 max-w-md">
                    Ajoutez des {type} à votre liste pour les regarder plus
                    tard.
                </p>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black">
                <Header />
                <div className="p-4">
                    <div className="max-w-7xl mx-auto pt-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Ma Watchlist
                            </h1>
                            <p className="text-gray-400">
                                Vos films et séries à regarder plus tard
                            </p>
                        </div>

                        {!hasAnyContent ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500/20 to-red-300/20 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-red-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-white mb-2">
                                        Votre watchlist est vide
                                    </h2>
                                    <p className="text-gray-400 max-w-md">
                                        Ajoutez des films et séries à votre
                                        liste pour les regarder plus tard.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Tabs defaultValue="movies" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-gray-900 mb-8">
                                    <TabsTrigger
                                        value="movies"
                                        className="data-[state=active]:bg-red-600"
                                    >
                                        Films ({movies.length})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="series"
                                        className="data-[state=active]:bg-blue-600"
                                    >
                                        Séries ({series.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="movies">
                                    {!hasMovies ? (
                                        <EmptyState type="films" />
                                    ) : (
                                        <div className="flex flex-wrap gap-2 md:gap-4 items-start justify-center md:justify-start">
                                            {movies.map((movie) => (
                                                <WatchlistMovieCard
                                                    key={movie.id}
                                                    movie={movie}
                                                    onRemove={removeMovie}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="series">
                                    {!hasSeries ? (
                                        <EmptyState type="séries" />
                                    ) : (
                                        <div className="flex flex-wrap gap-2 md:gap-4 items-start justify-center md:justify-start">
                                            {series.map((serie) => (
                                                <WatchlistSerieCard
                                                    key={serie.id}
                                                    serie={serie}
                                                    onRemove={removeSerie}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
