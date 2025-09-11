import MovieCard from "./MovieCard";

const WatchlistMovieCard = ({ movie, onRemove }) => {
    return <MovieCard movie={movie} onRemove={onRemove} />;
};

const WatchlistSerieCard = ({ serie, onRemove }) => {
    return <MovieCard serie={serie} onRemove={onRemove} />;
};

export { WatchlistMovieCard, WatchlistSerieCard };
