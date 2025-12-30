import { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import MovieCard from './MovieCard';
import './TopRatedPage.css'; // Reusing some ranking styles
import './ActorPage.css';

function ActorPage({ onMovieClick, onMovieSelect, isMovieSelected, onToggleWatchLater, isWatchLater }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');

    // Actor Search State
    const [actorQuery, setActorQuery] = useState('');
    const [selectedActor, setSelectedActor] = useState(null);
    const [actorSuggestions, setActorSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Initial load for genres
    useEffect(() => {
        ApiService.getGenres().then(setGenres).catch(console.error);
    }, []);

    // Handle clicks outside dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Search actor effect
    useEffect(() => {
        const searchActors = async () => {
            if (actorQuery.length < 2) {
                setActorSuggestions([]);
                return;
            }
            try {
                const results = await ApiService.searchPerson(actorQuery);
                const actors = results.filter(p => p.known_for_department === 'Acting');
                setActorSuggestions(actors.slice(0, 5));
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error searching actors", error);
            }
        };

        const timer = setTimeout(() => {
            if (!selectedActor || actorQuery !== selectedActor.name) {
                searchActors();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [actorQuery]);

    // Load movies when actor selected
    useEffect(() => {
        if (selectedActor) {
            loadActorMovies(selectedActor.id);
        }
    }, [selectedActor]);

    const loadActorMovies = async (personId) => {
        setLoading(true);
        try {
            const results = await ApiService.getPersonMovies(personId);
            setMovies(results); // The backend already sorts by vote_average desc
        } catch (error) {
            console.error("Error loading actor movies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleActorSelect = (actor) => {
        setActorQuery(actor.name);
        setSelectedActor(actor);
        setShowSuggestions(false);
    };

    // Filter movies based on genre
    const filteredMovies = movies.filter(m => {
        if (!selectedGenre) return true;
        return m.genre_ids && m.genre_ids.includes(parseInt(selectedGenre));
    });

    return (
        <div className="page-container fade-in">
            <div className="actor-search-section">
                <h2>Filmographie par Acteur</h2>
                <div className="search-wrapper" ref={wrapperRef}>
                    <input
                        type="text"
                        className="actor-search-input"
                        placeholder="Rechercher un acteur (ex: Brad Pitt)"
                        value={actorQuery}
                        onChange={(e) => setActorQuery(e.target.value)}
                        onFocus={() => actorQuery.length >= 2 && setShowSuggestions(true)}
                    />
                    {showSuggestions && actorSuggestions.length > 0 && (
                        <ul className="autocomplete-dropdown big-dropdown">
                            {actorSuggestions.map(actor => (
                                <li
                                    key={actor.id}
                                    onClick={() => handleActorSelect(actor)}
                                    className="actor-suggestion-item"
                                >
                                    {actor.profile_path && (
                                        <img src={actor.profile_path} alt={actor.name} className="actor-thumb" />
                                    )}
                                    <span>{actor.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedActor && (
                <div className="results-section">
                    <div className="filters-bar">
                        <h3>Films de {selectedActor.name} ({filteredMovies.length})</h3>
                        <div className="genre-selector">
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tous les types</option>
                                {genres.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="movies-grid grid-5">
                            <p>Chargement des films...</p>
                        </div>
                    ) : (
                        <div className="movies-grid grid-5">
                            {filteredMovies.map((movie, index) => (
                                <div key={movie.id} className="ranked-movie-card">
                                    <div className="rank-badge">#{index + 1}</div>
                                    <MovieCard
                                        movie={movie}
                                        onClick={() => onMovieClick(movie)}
                                        onSelect={onMovieSelect}
                                        isSelected={isMovieSelected(movie.id)}
                                        isWatchLater={isWatchLater(movie.id)}
                                        onToggleWatchLater={onToggleWatchLater}
                                    />
                                    {movie.character && (
                                        <div className="character-name">
                                            Rôle: {movie.character}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ActorPage;
