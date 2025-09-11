import MovieCard, { MovieCardSkeleton } from "./MovieCard";

const SerieCard = ({ serie, ...props }) => {
    return <MovieCard serie={serie} {...props} />;
};

const SerieCardSkeleton = MovieCardSkeleton;

export default SerieCard;
export { SerieCardSkeleton };
