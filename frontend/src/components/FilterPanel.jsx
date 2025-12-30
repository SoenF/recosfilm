import { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import './FilterPanel.css';

const GENRES = [
    "Action", "Aventure", "Animation", "Comédie", "Crime",
    "Documentaire", "Drame", "Familial", "Fantastique",
    "Histoire", "Horreur", "Musique", "Mystère", "Romance",
    "Science-Fiction", "Téléfilm", "Thriller", "Guerre", "Western"
];

function FilterPanel({ filters, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    // Actor Autocomplete State
    const [actorQuery, setActorQuery] = useState(filters.actor || '');
    const [actorSuggestions, setActorSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Update local state when filters prop changes (e.g. cleared externally)
    useEffect(() => {
        setActorQuery(filters.actor || '');
    }, [filters.actor]);

    // Handle clicks outside of suggestions
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
    }, [wrapperRef]);

    const handleChange = (key, value) => {
        const newFilters = { ...filters };
        if (value === '' || value === null) {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        onChange(newFilters);
    };

    // Debounce actor search
    useEffect(() => {
        const searchActors = async () => {
            if (actorQuery.length < 2) {
                setActorSuggestions([]);
                return;
            }

            try {
                const results = await ApiService.searchPerson(actorQuery);
                // Filter only actors
                const actors = results.filter(p => p.known_for_department === 'Acting');
                setActorSuggestions(actors.slice(0, 5));
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error searching actors", error);
            }
        };

        const timer = setTimeout(() => {
            // Only search if we are typing (and not just setting the value from selection)
            if (actorQuery !== filters.actor) {
                searchActors();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [actorQuery]);

    const handleActorSelect = (actorName) => {
        setActorQuery(actorName);
        handleChange('actor', actorName);
        setShowSuggestions(false);
    };

    const handleActorInputChange = (e) => {
        setActorQuery(e.target.value);
        if (e.target.value === '') {
            handleChange('actor', '');
        }
    };

    const countActiveFilters = () => {
        return Object.keys(filters).length;
    };

    return (
        <div className="filter-panel">
            <div className="filter-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H21M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Filtres avancés
                    {countActiveFilters() > 0 && (
                        <span className="active-badge"></span>
                    )}
                </h3>
                <svg
                    className={`filter-toggle-icon ${isOpen ? 'open' : ''}`}
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {isOpen && (
                <div className="filter-grid">
                    {/* Genre */}
                    <div className="filter-group">
                        <label>Genre</label>
                        <select
                            className="filter-select"
                            value={filters.genre || ''}
                            onChange={(e) => handleChange('genre', e.target.value)}
                        >
                            <option value="">Tous les genres</option>
                            {GENRES.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actor with Autocomplete */}
                    <div className="filter-group" ref={wrapperRef} style={{ position: 'relative' }}>
                        <label>Acteur</label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Ex: Leonardo DiCaprio"
                            value={actorQuery}
                            onChange={handleActorInputChange}
                            onFocus={() => actorQuery.length >= 2 && setShowSuggestions(true)}
                        />
                        {showSuggestions && actorSuggestions.length > 0 && (
                            <ul className="autocomplete-dropdown">
                                {actorSuggestions.map(actor => (
                                    <li
                                        key={actor.id}
                                        onClick={() => handleActorSelect(actor.name)}
                                    >
                                        {actor.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Min Year */}
                    <div className="filter-group">
                        <label>Année min.</label>
                        <input
                            type="number"
                            className="filter-input"
                            placeholder="Ex: 2000"
                            min="1900"
                            max="2030"
                            value={filters.year || ''}
                            onChange={(e) => handleChange('year', e.target.value)}
                        />
                    </div>

                    {/* Duration (Max only, as requested) */}
                    <div className="filter-group">
                        <label>Durée max. (minutes)</label>
                        <input
                            type="number"
                            className="filter-input"
                            placeholder="Ex: 120"
                            min="0"
                            value={filters.max_runtime || ''}
                            onChange={(e) => handleChange('max_runtime', e.target.value)}
                        />
                    </div>


                    {/* Min Rating */}
                    <div className="filter-group">
                        <label>Note min. ({filters.min_rating || 0})</label>
                        <input
                            type="range"
                            className="rating-slider"
                            min="0"
                            max="10"
                            step="0.5"
                            value={filters.min_rating || 0}
                            onChange={(e) => handleChange('min_rating', e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default FilterPanel;
