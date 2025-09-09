"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { betaseriesAuth } from "@/lib/betaseries";

export const usePersistedAuth = () => {
    const { user, refreshAuthIfNeeded } = useAuth();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        if (typeof window !== "undefined") {
            setIsOnline(navigator.onLine);
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
            }
        };
    }, []);

    useEffect(() => {
        const checkAuthPeriodically = async () => {
            if (!user || !isOnline) return;

            const isValid = await betaseriesAuth.isAuthenticated();
            if (!isValid) {
                console.log("Token expired, attempting to refresh...");
                await refreshAuthIfNeeded();
            }
        };

        const interval = setInterval(checkAuthPeriodically, 5 * 60 * 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && isOnline) {
                checkAuthPeriodically();
            }
        };

        if (typeof document !== "undefined") {
            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        }

        return () => {
            clearInterval(interval);
            if (typeof document !== "undefined") {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );
            }
        };
    }, [user, isOnline, refreshAuthIfNeeded]);

    return {
        isOnline,
        user,
    };
};
