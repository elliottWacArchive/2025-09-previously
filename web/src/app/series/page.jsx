"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import LatestSeries from "@/components/LatestSeries";
import TopRatedSeries from "@/components/TopRatedSeries";

export default function SeriesPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-black">
                <Header />
                <div className="p-4">
                    <div className="max-w-7xl mx-auto pt-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Séries
                            </h1>
                            <p className="text-gray-400">
                                Découvrez les meilleures séries du moment
                            </p>
                        </div>

                        <div className="space-y-12">
                            <LatestSeries />
                            <TopRatedSeries />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
