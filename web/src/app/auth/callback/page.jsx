"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { betaseriesAuth } from "@/lib/betaseries";

export default function AuthCallbackPage() {
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get("code");
                const state = searchParams.get("state");
                const error = searchParams.get("error");

                if (error) {
                    throw new Error(`OAuth Error: ${error}`);
                }

                if (!code) {
                    throw new Error("No authorization code received");
                }

                if (state) {
                    const storedState = localStorage.getItem("oauth_state");
                    if (state !== storedState) {
                        throw new Error("Invalid state parameter");
                    }
                    localStorage.removeItem("oauth_state");
                }

                setStatus("exchanging");

                const response = await fetch(
                    "http://localhost:8080/api/v1/auth/callback",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            code: code,
                            state: state,
                        }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.error || "Failed to authenticate"
                    );
                }

                const authData = await response.json();
                console.log("DEBUG: Auth data received:", authData);

                if (!authData.access_token || !authData.user) {
                    throw new Error("Invalid response from server");
                }

                login(authData.user, authData.access_token);

                setStatus("success");

                setTimeout(() => {
                    router.push("/home");
                }, 1500);
            } catch (error) {
                console.error("OAuth callback error:", error);
                setError(error.message);
                setStatus("error");

                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        };

        handleCallback();
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
            <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-xl border border-gray-700 text-center max-w-md w-full">
                {status === "loading" && (
                    <>
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Authentification en cours...
                        </h2>
                        <p className="text-gray-400">
                            Vérification des paramètres OAuth
                        </p>
                    </>
                )}

                {status === "exchanging" && (
                    <>
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Échange du code d'autorisation...
                        </h2>
                        <p className="text-gray-400">
                            Obtention du token d'accès
                        </p>
                    </>
                )}

                {status === "fetching_user" && (
                    <>
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Récupération de vos données...
                        </h2>
                        <p className="text-gray-400">
                            Connexion à votre profil BetaSeries
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Connexion réussie !
                        </h2>
                        <p className="text-gray-400">
                            Redirection vers l'accueil...
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Erreur d'authentification
                        </h2>
                        <p className="text-red-400 mb-4">
                            {error || "Une erreur s'est produite"}
                        </p>
                        <p className="text-gray-400 text-sm">
                            Redirection vers la page de connexion...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
