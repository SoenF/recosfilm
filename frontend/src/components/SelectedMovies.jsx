import { useState } from 'react';
import MovieCard from './MovieCard';
import FilterPanel from './FilterPanel';
import './SelectedMovies.css';

function SelectedMovies({ movies, filters, onFilterChange, onRemove, onUpdateRating, onGetRecommendations, onViewMovie }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGetRecommendations = async () => {
        setIsLoading(true);
        await onGetRecommendations();
        setIsLoading(false);
    };

    if (movies.length === 0) {
        return null;
    }

    return (
        <div className="selected-movies-section">
            <div className="selected-header">
                <div>
                    <h2>Films sélectionnés</h2>
                    <p className="selected-subtitle">
                        {movies.length} film{movies.length > 1 ? 's' : ''} sélectionné{movies.length > 1 ? 's' : ''}
                    </p>
                </div>

                <button
                    className="btn btn-primary get-recommendations-btn"
                    onClick={handleGetRecommendations}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="spinner"></div>
                            Chargement...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Obtenir des recommandations
                        </>
                    )}
                </button>
            </div>

            <FilterPanel filters={filters || {}} onChange={onFilterChange || (() => { })} />

            <div className="selected-movies-grid">
                {movies.map((movie) => (
                    <div key={movie.id} className="selected-movie-wrapper">
                        <MovieCard
                            movie={movie}
                            isSelected={true}
                            onClick={() => onViewMovie(movie)}
                            onSelect={() => onRemove(movie.id)}
                        />
                        <div className="rating-control">
                            <label>Note: <span className="rating-value">{movie.userRating}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={movie.userRating}
                                onChange={(e) => onUpdateRating(movie.id, e.target.value)}
                                className="rating-slider"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SelectedMovies;
