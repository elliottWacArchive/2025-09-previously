"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import { useRouter } from "next/navigation";
import { useWatchlist } from "@/contexts/WatchlistContext";

const MovieCard = ({
    movie,
    isOverlayOpen = false,
    onCardClick,
    onOverlayClose,
}) => {
    const router = useRouter();
    const { toggleMovie, isMovieInWatchlist } = useWatchlist();
    if (!movie) {
        return <MovieCardSkeleton />;
    }

    const title = movie.title || "Titre inconnu";
    const titleLength = title.length;
    let descriptionClass = "line-clamp-8";

    const truncateText = (text, maxLength) => {
        if (!text) return "Aucun synopsis disponible.";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + "...";
    };

    let maxDescriptionLength = 500;

    const rating = movie.vote_average || 0;
    let badgeColor;

    if (rating >= 7.5) {
        badgeColor = "bg-green-500/90";
    } else if (rating >= 5.0) {
        badgeColor = "bg-yellow-500/90";
    } else {
        badgeColor = "bg-red-500/90";
    }

    const handleCardClick = () => {
        if (onCardClick && movie.id) {
            onCardClick(movie.id);
        }
    };

    return (
        <div
            className="bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition-colors overflow-hidden group rounded-lg p-3 h-full flex flex-col relative cursor-pointer"
            onClick={handleCardClick}
        >
            <div
                className={`${
                    isOverlayOpen ? "blur-sm" : "blur-none"
                } transition-all duration-500 ease-in-out`}
            >
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-3 flex-shrink-0">
                    <img
                        src={
                            movie.backdrop_path
                                ? tmdbApi.getImageUrl(
                                      movie.backdrop_path,
                                      "w780"
                                  )
                                : "/placeholder-image.jpg"
                        }
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-100 transition-transform duration-300 rounded-lg"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg" />

                    {movie.logo_path && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={tmdbApi.getImageUrl(
                                    movie.logo_path,
                                    "w300"
                                )}
                                alt={`${title} logo`}
                                className="max-w-[70%] max-h-[40%] object-contain drop-shadow-lg transform transition-transform duration-300 group-hover:scale-115"
                            />
                        </div>
                    )}

                    <div className="absolute top-2 right-2">
                        <Badge
                            variant="secondary"
                            className={`${badgeColor} text-white font-semibold flex items-center gap-1`}
                        >
                            <Star className="h-3 w-3 fill-current" />
                            {rating.toFixed(1)}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-col flex-1 min-h-0">
                    <h3
                        className={`text-white font-semibold text-sm mb-2 ${
                            titleLength > 50 ? "line-clamp-2" : "line-clamp-1"
                        }`}
                    >
                        {title}
                    </h3>
                    <div className="flex justify-between items-center text-gray-400 text-[10px] mb-1">
                        <span>
                            {movie.release_date
                                ? new Date(movie.release_date).getFullYear()
                                : "Année inconnue"}
                        </span>
                        <span className="text-right truncate ml-2">
                            {movie.genreNames && movie.genreNames.length > 0
                                ? movie.genreNames[0]
                                : "Genre inconnu"}
                        </span>
                    </div>
                    <p
                        className={`text-gray-500 text-xs flex-1 ${descriptionClass}`}
                    >
                        {truncateText(movie.overview, maxDescriptionLength)}
                    </p>
                </div>
            </div>

            {isOverlayOpen && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg z-10 transition-all duration-500 ease-in-out"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOverlayClose();
                    }}
                >
                    <div
                        className="flex flex-col gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="w-40 h-14 bg-transparent border-2 border-white/80 text-white rounded-full text-lg font-semibold backdrop-blur-sm select-none cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-green-500 hover:bg-opacity-90 hover:border-green-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/movie/${movie.id}`);
                            }}
                        >
                            Voir détails
                        </div>
                        <div
                            className="w-40 h-14 bg-transparent border-2 border-white/80 text-white rounded-full text-lg font-semibold backdrop-blur-sm select-none cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-green-500 hover:bg-opacity-90 hover:border-green-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log("Watch clicked");
                            }}
                        >
                            Watch
                        </div>
                        <div
                            className={`w-40 h-14 bg-transparent border-2 text-white rounded-full text-lg font-semibold backdrop-blur-sm select-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
                                isMovieInWatchlist(movie.id)
                                    ? "border-green-500 text-green-400 hover:bg-green-500/20"
                                    : "border-white/80 hover:bg-blue-500 hover:bg-opacity-90 hover:border-blue-500"
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMovie(movie);
                            }}
                        >
                            {isMovieInWatchlist(movie.id) ? (
                                <>
                                    <BookmarkCheck className="h-4 w-4" />
                                    Ajouté
                                </>
                            ) : (
                                <>
                                    <Bookmark className="h-4 w-4" />
                                    Watchlist
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieCard;

export const MovieCardSkeleton = () => {
    return (
        <div className="bg-gray-900/50 border border-gray-800 overflow-hidden rounded-lg p-3 h-full flex flex-col">
            <div className="aspect-[2/3] mb-3">
                <Skeleton className="w-full h-full bg-gray-800 rounded-lg" />
            </div>
            <div className="flex-1 flex flex-col">
                <Skeleton className="h-4 w-3/4 mb-2 bg-gray-800" />
                <Skeleton className="h-3 w-1/2 mb-2 bg-gray-800" />
                <Skeleton className="h-3 w-full bg-gray-800 flex-1" />
            </div>
        </div>
    );
};

export { MovieCardSkeleton };
