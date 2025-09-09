"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilPage() {
    const { user, logout } = useAuth();

    const displayName =
        user?.username ||
        user?.name ||
        user?.email?.split("@")[0] ||
        "Utilisateur";

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black">
                <Header />
                <div className="p-4">
                    <div className="max-w-4xl mx-auto pt-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Mon Profil
                            </h1>
                            <p className="text-gray-400">
                                Gérez vos informations personnelles
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        Informations du compte
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">
                                            Nom d'utilisateur
                                        </label>
                                        <p className="text-white mt-1">
                                            {displayName}
                                        </p>
                                    </div>
                                    {user?.email && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-400">
                                                Email
                                            </label>
                                            <p className="text-white mt-1">
                                                {user.email}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        Mes statistiques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-red-500/10 rounded-lg">
                                            <div className="text-2xl font-bold text-red-400">
                                                0
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Films vus
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-red-500/10 rounded-lg">
                                            <div className="text-2xl font-bold text-red-400">
                                                0
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Séries suivies
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-red-500/10 rounded-lg">
                                            <div className="text-2xl font-bold text-red-400">
                                                0
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                En watchlist
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        Actions du compte
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={logout}
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        Se déconnecter
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
