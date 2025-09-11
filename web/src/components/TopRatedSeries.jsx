"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import SerieCard, { SerieCardSkeleton } from "./SerieCard";

export default function TopRatedSeries() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const isMobile = window.innerWidth < 768;
            const scrollDistance = isMobile ? 162 : 224;
            scrollContainerRef.current.scrollBy({
                left: -scrollDistance,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const isMobile = window.innerWidth < 768;
            const scrollDistance = isMobile ? 162 : 224;
            scrollContainerRef.current.scrollBy({
                left: scrollDistance,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        const fetchTopRatedSeries = async () => {
            try {
                setLoading(true);

                const [page1, page2] = await Promise.all([
                    tmdbApi.getTopRatedSeries(1),
                    tmdbApi.getTopRatedSeries(2),
                ]);

                const allSeries = [...page1.results, ...page2.results];

                const highRatedSeries = allSeries
                    .filter((serie) => serie.vote_average >= 7.0)
                    .sort((a, b) => b.vote_average - a.vote_average)
                    .slice(0, 15);

                setSeries(highRatedSeries);
            } catch (error) {
                console.error("Error fetching top rated series:", error);
                setError("Impossible de charger les séries les mieux notées");
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedSeries();
    }, []);

    if (loading) {
        return (
            <section className="relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Séries les mieux notées
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
                        Séries les mieux notées
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
                    Séries les mieux notées
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
                className="flex gap-3 md:gap-6 overflow-x-auto pb-4 scrollbar-hide h-[350px] md:h-[450px]"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {loading
                    ? Array.from({ length: 12 }, (_, i) => (
                          <div key={i} className="flex-none">
                              <SerieCardSkeleton />
                          </div>
                      ))
                    : series.map((serie) => (
                          <div key={serie.id} className="flex-none">
                              <SerieCard serie={serie} />
                          </div>
                      ))}
            </div>
        </section>
    );
}
