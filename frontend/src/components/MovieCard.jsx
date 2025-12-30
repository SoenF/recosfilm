import './MovieCard.css';

function MovieCard({ movie, onClick, onSelect, isSelected = false, showScore = false, onToggleWatchLater, isWatchLater = false }) {
    const posterUrl = movie.poster_path || movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
    const rating = movie.vote_average || 0;
    const score = movie.score || 0;

    const getRatingColor = (rating) => {
        if (rating >= 7.5) return 'var(--rating-high)';
        if (rating >= 6.0) return 'var(--rating-medium)';
        return 'var(--rating-low)';
    };

    const handleSelect = (e) => {
        e.stopPropagation();
        if (onSelect) onSelect(movie);
    };

    return (
        <div
            className={`movie-card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="movie-poster">
                <img src={posterUrl} alt={movie.title} loading="lazy" />

                {onSelect && (
                    <button
                        className={`select-btn ${isSelected ? 'is-selected' : ''}`}
                        onClick={handleSelect}
                        title={isSelected ? "Retirer de ma recherche" : "Ajouter à ma recherche"}
                    >
                        {isSelected ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                )}

                {onToggleWatchLater && (
                    <button
                        className={`watch-later-btn ${isWatchLater ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchLater(movie);
                        }}
                        title={isWatchLater ? "Retirer de la liste à regarder plus tard" : "Ajouter à regarder plus tard"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isWatchLater ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>

                <div className="movie-meta">
                    {movie.release_date && (
                        <span className="movie-year">
                            {new Date(movie.release_date).getFullYear()}
                        </span>
                    )}

                    {rating > 0 && (
                        <span className="movie-rating" style={{ color: getRatingColor(rating) }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {rating.toFixed(1)}
                        </span>
                    )}

                    {movie.runtime > 0 && (
                        <span className="movie-runtime">
                            {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                        </span>
                    )}

                    {showScore && (
                        <span className="movie-score">
                            {(score * 100).toFixed(0)}% match
                        </span>
                    )}
                </div>

                {movie.genres && movie.genres.length > 0 && (
                    <div className="movie-genres">
                        {movie.genres.slice(0, 3).map((genre, index) => (
                            <span key={index} className="genre-badge">{genre}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MovieCard;
