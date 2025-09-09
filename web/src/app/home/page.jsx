"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import LatestMovies from "@/components/LatestMovies";
import TopRatedMovies from "@/components/TopRatedMovies";
import { usePersistedAuth } from "@/hooks/usePersistedAuth";

export default function HomePage() {
    const { isOnline, user } = usePersistedAuth();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black">
                <Header />
                <div className="p-4">
                    <div className="max-w-7xl mx-auto pt-8">
                        {!isOnline && (
                            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                    <span className="text-orange-200 text-sm">
                                        Mode hors ligne - Certaines
                                        fonctionnalités peuvent être limitées
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Films
                            </h1>
                            <p className="text-gray-400">
                                Découvrez les dernières sorties cinéma
                            </p>
                        </div>

                        <div className="space-y-12">
                            <LatestMovies />
                            <TopRatedMovies />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
