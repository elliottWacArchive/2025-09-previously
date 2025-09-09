"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        console.log("URL actuelle:", window.location.href);
        console.log("Code OAuth détecté:", code);
        console.log("State OAuth détecté:", state);

        if (code) {
            console.log("Démarrage du processus de callback OAuth...");
            handleOAuthCallback(code, state);
        }
    }, [searchParams]);

    const handleOAuthCallback = async (code, state) => {
        console.log(
            "🔄 Début du callback OAuth avec code:",
            code,
            "et state:",
            state
        );
        setIsLoading(true);
        setError("");

        try {
            console.log("📡 Envoi de la requête à l'API Go...");
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/callback",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code, state }),
                }
            );

            console.log("📥 Réponse de l'API reçue, status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Erreur de l'API:", errorData);
                throw new Error(
                    errorData.error || "Erreur lors de la connexion"
                );
            }

            const data = await response.json();
            console.log("✅ Données utilisateur reçues:", data);

            login({
                id: data.user.id,
                username: data.user.login,
                email: data.user.login,
                accessToken: data.access_token,
            });

            console.log("🏠 Redirection vers /home...");
            router.push("/home");
        } catch (error) {
            console.error("❌ Erreur OAuth:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBetaSeriesLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/login?state=login_state"
            );

            if (!response.ok) {
                throw new Error(
                    "Erreur lors de la récupération de l'URL d'authentification"
                );
            }

            const data = await response.json();
            window.location.href = data.url;
        } catch (error) {
            console.error("Erreur lors de la connexion BetaSeries:", error);
            setError("Impossible de se connecter à BetaSeries");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 opacity-50">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 via-purple-500/3 to-pink-500/5 rounded-full blur-3xl animate-spin"
                        style={{ animationDuration: "30s" }}
                    ></div>
                </div>
            </div>

            <div className="z-10 w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-none bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent">
                        Previously On
                    </h1>
                    <p className="text-gray-400 text-lg mb-8">
                        Connectez-vous avec votre compte BetaSeries
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-600/30 text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <Button
                        onClick={handleBetaSeriesLogin}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Connexion en cours...
                            </div>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5 mr-2"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm5.568 8.16c-.169-.283-.425-.558-.694-.757-.678-.507-1.554-.835-2.418-.835H9.784c-.864 0-1.74.328-2.418.835-.269.199-.525.474-.694.757-.338.564-.438 1.213-.438 1.853v3.974c0 .64.1 1.289.438 1.853.169.283.425.558.694.757.678.507 1.554.835 2.418.835h4.672c.864 0 1.74-.328 2.418-.835.269-.199.525-.474.694-.757.338-.564.438-1.213.438-1.853v-3.974c0-.64-.1-1.289-.438-1.853z" />
                                </svg>
                                Se connecter avec BetaSeries
                            </>
                        )}
                    </Button>

                    <div className="text-center">
                        <span className="text-gray-400 text-sm">
                            Pas encore de compte BetaSeries ?{" "}
                        </span>
                        <a
                            href="https://www.betaseries.com/inscription"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                            Créer un compte
                        </a>
                    </div>

                    <div className="text-center pt-4">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            ← Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
