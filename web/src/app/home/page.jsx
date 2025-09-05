"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import LatestMovies from "@/components/LatestMovies";
import TopRatedMovies from "@/components/TopRatedMovies";

export default function HomePage() {
    const { user, logout } = useAuth();

    const displayName =
        user?.username ||
        user?.name ||
        user?.email?.split("@")[0] ||
        "Utilisateur";

    return (
        <ProtectedRoute>
            <div className="min-h-screen p-4">
                <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Bienvenue, {displayName} !
                        </h1>
                        <p className="text-gray-400">
                            Découvrez les dernières sorties cinéma
                        </p>
                    </div>
                    <Button
                        onClick={logout}
                        variant="outline"
                        className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                    >
                        Se déconnecter
                    </Button>
                </div>

                <div className="max-w-7xl mx-auto space-y-12">
                    <LatestMovies />
                    <TopRatedMovies />
                </div>
            </div>
        </ProtectedRoute>
    );
}
