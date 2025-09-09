"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import SerieCard, { SerieCardSkeleton } from "./SerieCard";

export default function LatestSeries() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openOverlayId, setOpenOverlayId] = useState(null);
    const scrollContainerRef = useRef(null);

    const handleCardClick = (serieId) => {
        setOpenOverlayId(serieId);
    };

    const handleOverlayClose = () => {
        setOpenOverlayId(null);
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -200,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 200,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getLatestSeries();
                const sortedSeries = (data.results || [])
                    .sort((a, b) => b.vote_average - a.vote_average)
                    .slice(0, 12);
                setSeries(sortedSeries);
            } catch (error) {
                console.error("Error fetching latest series:", error);
                setError("Impossible de charger les dernières séries");
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, []);

    if (loading) {
        return (
            <section className="relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Dernières séries
                    </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="flex-none w-72 h-72">
                            <SerieCardSkeleton />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Dernières séries
                    </h2>
                </div>
                <div className="flex items-center justify-center h-48 bg-gray-900/50 rounded-lg border border-gray-800">
                    <p className="text-gray-400">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                    Dernières séries
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollLeft}
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollRight}
                        className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {series.map((serie) => (
                    <div key={serie.id} className="flex-none w-72 h-72">
                        <SerieCard
                            serie={serie}
                            isOverlayOpen={openOverlayId === serie.id}
                            onCardClick={handleCardClick}
                            onOverlayClose={handleOverlayClose}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
