"use client";

import { tmdbApi } from "@/lib/tmdb";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WatchlistMovieCard = ({ movie, onRemove }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/movie/${movie.id}`);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onRemove(movie.id);
    };

    return (
        <div
            className="relative group cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={handleClick}
        >
            <Button
                onClick={handleRemove}
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 z-10 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600 hover:bg-red-700"
            >
                <X className="h-3 w-3" />
            </Button>

            <div className="aspect-[2/3] mb-2 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <img
                    src={
                        movie.poster_path
                            ? tmdbApi.getImageUrl(movie.poster_path, "w500")
                            : "/placeholder-movie.jpg"
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
            </div>

            <div className="text-center">
                <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                    {movie.title}
                </h3>
                <p className="text-gray-400 text-xs">
                    {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "Année inconnue"}
                </p>
            </div>
        </div>
    );
};

const WatchlistSerieCard = ({ serie, onRemove }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/serie/${serie.id}`);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onRemove(serie.id);
    };

    const title = serie.name || serie.title;

    return (
        <div
            className="relative group cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={handleClick}
        >
            <Button
                onClick={handleRemove}
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 z-10 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600 hover:bg-red-700"
            >
                <X className="h-3 w-3" />
            </Button>

            <div className="aspect-[2/3] mb-2 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <img
                    src={
                        serie.poster_path
                            ? tmdbApi.getImageUrl(serie.poster_path, "w500")
                            : "/placeholder-movie.jpg"
                    }
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
            </div>

            <div className="text-center">
                <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                    {title}
                </h3>
                <p className="text-gray-400 text-xs">
                    {serie.first_air_date
                        ? new Date(serie.first_air_date).getFullYear()
                        : "Année inconnue"}
                </p>
            </div>
        </div>
    );
};

export { WatchlistMovieCard, WatchlistSerieCard };
