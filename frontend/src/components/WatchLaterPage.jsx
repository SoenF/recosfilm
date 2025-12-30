import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import './WatchLaterPage.css';

function WatchLaterPage({ watchLaterMovies, onRemoveWatchLater, onMovieClick, onMovieSelect, isMovieSelected }) {
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [actorFilter, setActorFilter] = useState('');
    const [maxDuration, setMaxDuration] = useState(240);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        // Build unique genres list from movies
        const allGenres = new Set();
        watchLaterMovies.forEach(m => {
            if (m.genres) m.genres.forEach(g => allGenres.add(g));
        });
        setGenres(Array.from(allGenres).sort());
    }, [watchLaterMovies]);

    useEffect(() => {
        let result = [...watchLaterMovies];

        if (actorFilter) {
            result = result.filter(m =>
                m.cast && m.cast.some(actor =>
                    actor.toLowerCase().includes(actorFilter.toLowerCase())
                )
            );
        }

        if (maxDuration) {
            result = result.filter(m => (m.runtime || 0) <= maxDuration);
        }

        if (selectedGenre) {
            result = result.filter(m => m.genres && m.genres.includes(selectedGenre));
        }

        setFilteredMovies(result);
    }, [watchLaterMovies, actorFilter, maxDuration, selectedGenre]);

    return (
        <div className="watch-later-page fade-in">
            <div className="page-header">
                <h2>Ma Liste à regarder plus tard</h2>
                <div className="watch-later-filters">
                    <div className="filter-group">
                        <label>Acteur :</label>
                        <input
                            type="text"
                            placeholder="Nom de l'acteur..."
                            value={actorFilter}
                            onChange={(e) => setActorFilter(e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Durée max ({maxDuration} min) :</label>
                        <input
                            type="range"
                            min="30"
                            max="240"
                            step="10"
                            value={maxDuration}
                            onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                            className="filter-range"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Genre :</label>
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Tous les genres</option>
                            {genres.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredMovies.length === 0 ? (
                <div className="empty-state">
                    <p>{watchLaterMovies.length === 0 ? "Votre liste est vide." : "Aucun film ne correspond à ces filtres."}</p>
                </div>
            ) : (
                <div className="movies-grid grid-5">
                    {filteredMovies.map(movie => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onClick={() => onMovieClick(movie)}
                            onSelect={onMovieSelect}
                            isSelected={isMovieSelected(movie.id)}
                            onToggleWatchLater={() => onRemoveWatchLater(movie.id)}
                            isWatchLater={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default WatchLaterPage;
