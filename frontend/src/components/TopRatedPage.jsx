import { useState, useEffect, useRef, useCallback } from 'react';
import ApiService from '../services/api';
import MovieCard from './MovieCard';
import './TopRatedPage.css';

function TopRatedPage({ onMovieClick, onMovieSelect, isMovieSelected, viewingMovie, setViewingMovie, onToggleWatchLater, isWatchLater }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Sentinel for infinite scroll
    const observer = useRef();
    const sentinelRef = useRef(null);

    useEffect(() => {
        if (loading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (sentinelRef.current) {
            observer.current.observe(sentinelRef.current);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        }
    }, [loading, hasMore, movies]); // Re-attach when movies change (layout shift) or loading ends

    useEffect(() => {
        // Fetch genres on mount
        ApiService.getGenres().then(setGenres).catch(console.error);
    }, []);

    // Reset when genre changes
    useEffect(() => {
        setMovies([]);
        setPage(1);
        setHasMore(true);
    }, [selectedGenre]);

    useEffect(() => {
        loadMovies();
    }, [page, selectedGenre]);

    const loadMovies = async () => {
        setLoading(true);
        try {
            const params = {
                sort_by: 'vote_average.desc',
                min_vote_count: 500, // Reasonable threshold
                page: page
            };

            if (selectedGenre) {
                params.genre_id = selectedGenre;
            }

            const data = await ApiService.discoverMovies(params);

            // Append new movies, avoiding duplicates
            setMovies(prev => {
                // If page 1, replace. Else append.
                if (page === 1) return data.results;

                const newMovies = data.results.filter(newM =>
                    !prev.some(existingM => existingM.id === newM.id)
                );
                return [...prev, ...newMovies];
            });

            setHasMore(data.page < data.total_pages);

        } catch (error) {
            console.error("Error loading top movies", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <h2>Meilleurs Films sur la plateforme</h2>
                <div className="genre-selector">
                    <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Toutes les catégories</option>
                        {genres.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="movies-grid grid-5">
                {movies.map((movie, index) => (
                    <div
                        key={`${movie.id}-${index}`}
                        className="ranked-movie-card"
                    >
                        <div className="rank-badge">#{index + 1}</div>
                        <MovieCard
                            movie={movie}
                            onClick={() => onMovieClick(movie)}
                            onSelect={onMovieSelect}
                            isSelected={isMovieSelected(movie.id)}
                            isWatchLater={isWatchLater(movie.id)}
                            onToggleWatchLater={onToggleWatchLater}
                        />
                    </div>
                ))}
            </div>

            {/* Sentinel for IntersectionObserver */}
            <div ref={sentinelRef} style={{ height: '20px', width: '100%', margin: '10px 0' }}></div>

            {loading && (
                <div className="movies-grid grid-5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="movie-card-skeleton">
                            <div className="skeleton skeleton-poster"></div>
                            <div className="skeleton-content"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TopRatedPage;
