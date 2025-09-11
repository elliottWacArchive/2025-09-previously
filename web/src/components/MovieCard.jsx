"use client";

import { tmdbApi } from "@/lib/tmdb";
import { useRouter } from "next/navigation";
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useWatchlist } from "@/contexts/WatchlistContext";

const MovieCard = ({ movie, serie, type, onRemove }) => {
    const router = useRouter();
    const { toggleMovie, isMovieInWatchlist, toggleSerie, isSerieInWatchlist } =
        useWatchlist();

    const item = movie || serie;
    const itemType = type || (movie ? "movie" : "serie");

    const [isClicked, setIsClicked] = useState(false);
    const [itemImages, setItemImages] = useState({
        backdrop_path: item?.backdrop_path || null,
        logo_path: item?.logo_path || null,
    });
    const [isHovered, setIsHovered] = useState(false);

    if (!item) {
        return <MovieCardSkeleton />;
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isClicked && !event.target.closest(".movie-card")) {
                setIsClicked(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isClicked]);

    useEffect(() => {
        const enrichItem = async () => {
            if (!item.backdrop_path || !item.logo_path) {
                try {
                    const images =
                        itemType === "movie"
                            ? await tmdbApi.enrichMovieWithImages(item.id)
                            : await tmdbApi.enrichSerieWithImages(item.id);
                    setItemImages((prev) => ({
                        backdrop_path:
                            prev.backdrop_path || images.backdrop_path,
                        logo_path: prev.logo_path || images.logo_path,
                    }));
                } catch (error) {
                    console.error("Error enriching item:", error);
                }
            }
        };

        enrichItem();
    }, [item.id, item.backdrop_path, item.logo_path, itemType]);

    const handleClick = () => {
        console.log("Card clicked, current state:", isClicked);
        setIsClicked(!isClicked);
    };

    const handleWatchlistToggle = (e) => {
        if (e) e.stopPropagation();
        if (onRemove) {
            onRemove(item.id);
        } else {
            if (itemType === "movie") {
                toggleMovie(item);
            } else {
                toggleSerie(item);
            }
        }
    };

    const backdropUrl = itemImages.backdrop_path
        ? tmdbApi.getImageUrl(itemImages.backdrop_path, "w780")
        : item.poster_path
        ? tmdbApi.getImageUrl(item.poster_path)
        : "/placeholder-movie.jpg";

    const logoUrl = itemImages.logo_path
        ? tmdbApi.getImageUrl(itemImages.logo_path, "w300")
        : null;

    const posterUrl = item.poster_path
        ? tmdbApi.getImageUrl(item.poster_path)
        : "/placeholder-movie.jpg";

    const rating = item.vote_average || 0;
    let badgeColor;

    if (rating >= 7.5) {
        badgeColor = "bg-green-500/90";
    } else if (rating >= 5.0) {
        badgeColor = "bg-yellow-500/90";
    } else {
        badgeColor = "bg-red-500/90";
    }

    const isInWatchlist =
        itemType === "movie"
            ? isMovieInWatchlist(item.id)
            : isSerieInWatchlist(item.id);

    const isInWatchlistContext = onRemove ? true : isInWatchlist;

    const title =
        itemType === "movie"
            ? item.title
            : item.name || item.title || "Titre inconnu";

    const releaseYear =
        itemType === "movie"
            ? item.release_date
                ? new Date(item.release_date).getFullYear()
                : "Année inconnue"
            : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : "Année inconnue";

    const detailsUrl =
        itemType === "movie" ? `/movie/${item.id}` : `/serie/${item.id}`;

    return (
        <div
            className={`
                relative group cursor-pointer overflow-hidden rounded-lg bg-gray-800 movie-card
                h-[300px] md:h-[400px]
                ${
                    isHovered || isClicked
                        ? "w-[280px] md:w-[600px]"
                        : "w-[150px] md:w-[200px]"
                }
                transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]
            `}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0">
                {backdropUrl ? (
                    <img
                        src={backdropUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            <div
                className={`
                    absolute inset-0 transition-opacity duration-600
                    bg-gradient-to-t from-black/80 via-black/40 to-transparent
                    ${isHovered || isClicked ? "opacity-100" : "opacity-0"}
                `}
            />

            <div
                className={`
                    absolute z-10 transition-all duration-600 ease-out
                    ${
                        isHovered || isClicked
                            ? "bottom-6 left-6 right-6"
                            : "top-1/2 left-4 right-4 -translate-y-1/2"
                    }
                `}
            >
                {logoUrl ? (
                    <div
                        className={`flex mb-4 ${
                            isHovered || isClicked
                                ? "justify-start"
                                : "justify-center"
                        }`}
                    >
                        <img
                            src={logoUrl}
                            alt={title}
                            className={`
                                max-h-16 w-auto object-contain transition-all duration-600
                                ${
                                    isHovered || isClicked
                                        ? "max-w-48"
                                        : "max-w-32"
                                }
                            `}
                        />
                    </div>
                ) : (
                    <h3
                        className={`font-bold text-white mb-2 transition-all duration-600 ${
                            isHovered || isClicked ? "text-left" : "text-center"
                        } ${
                            title && title.length > 20 ? "text-sm" : "text-lg"
                        }`}
                    >
                        {title}
                    </h3>
                )}

                <div
                    className={`text-white transition-all duration-600 ${
                        isHovered || isClicked
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                    }`}
                >
                    <p className="text-sm opacity-90 mb-3 font-medium">
                        {releaseYear}
                    </p>
                    {item.overview && (
                        <p className="text-sm opacity-80 line-clamp-4 leading-relaxed">
                            {item.overview}
                        </p>
                    )}
                    {item.vote_average && (
                        <div className="flex items-center gap-1 md:gap-2 mt-3 flex-wrap">
                            <Badge
                                variant="secondary"
                                className={`${badgeColor} text-white font-semibold flex items-center gap-1 px-2 md:px-3 py-1 text-xs md:text-sm h-6 md:h-8`}
                            >
                                <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                                {rating.toFixed(1)}
                            </Badge>
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white h-6 md:h-8 px-2 md:px-3 text-xs md:text-sm"
                            >
                                Évaluer
                            </Button>
                            {!onRemove && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white h-6 md:h-8 px-2 md:px-3 text-xs md:text-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWatchlistToggle();
                                    }}
                                >
                                    {isInWatchlist ? "Retirer" : "Watchlist"}
                                </Button>
                            )}
                            {onRemove && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white h-6 md:h-8 px-2 md:px-3 text-xs md:text-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(item.id);
                                    }}
                                >
                                    Supprimer
                                </Button>
                            )}
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-gray-600 hover:bg-gray-700 text-white h-6 md:h-8 px-2 md:px-3 text-xs md:text-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(detailsUrl);
                                }}
                            >
                                Détails
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MovieCardSkeleton = () => {
    return (
        <div className="relative overflow-hidden rounded-lg bg-gray-800">
            <div className="aspect-[2/3] w-full">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="absolute bottom-4 left-4 right-4">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
};

const SerieCard = MovieCard;
const SerieCardSkeleton = MovieCardSkeleton;

export default MovieCard;
export { MovieCardSkeleton, SerieCard, SerieCardSkeleton };
