"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading, refreshAuthIfNeeded } = useAuth();
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            if (loading) return;

            if (!user) {
                const refreshed = await refreshAuthIfNeeded();
                if (!refreshed) {
                    router.push("/login");
                    return;
                }
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [user, loading, refreshAuthIfNeeded, router]);

    if (loading || isChecking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-xl border border-gray-700 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">
                        Vérification de l'authentification...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return children;
}
