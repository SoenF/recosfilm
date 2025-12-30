import { useState, useEffect, useCallback } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, onClear }) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search
    useEffect(() => {
        if (!query.trim()) {
            onClear();
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            onSearch(query);
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, onSearch, onClear]);

    const handleClear = () => {
        setQuery('');
        onClear();
    };

    return (
        <div className="search-bar">
            <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <input
                    type="text"
                    className="input search-input"
                    placeholder="Rechercher un film... (ex: Inception, Matrix)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                {query && (
                    <button
                        className="clear-button"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                )}

                {isSearching && (
                    <div className="search-spinner">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchBar;
