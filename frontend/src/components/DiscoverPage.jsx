import { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import MovieCard from './MovieCard';
import './TopRatedPage.css'; // Reusing layout styles

function DiscoverPage({ onMovieClick, onMovieSelect, isMovieSelected, onToggleWatchLater, isWatchLater }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState('popularity.desc');

    const observer = useRef();
    const sentinelRef = useRef(null);

    useEffect(() => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(p => p + 1);
            }
        });
        if (sentinelRef.current) observer.current.observe(sentinelRef.current);
        return () => observer.current && observer.current.disconnect();
    }, [loading, hasMore, movies]);

    useEffect(() => {
        ApiService.getGenres().then(setGenres).catch(console.error);
    }, []);

    useEffect(() => {
        setMovies([]);
        setPage(1);
        setHasMore(true);
    }, [selectedGenre, sortBy]);

    useEffect(() => {
        loadMovies();
    }, [page, selectedGenre, sortBy]);

    const loadMovies = async () => {
        setLoading(true);
        try {
            const params = {
                sort_by: sortBy,
                min_vote_count: 1000, // Ensure there's a significant number of reviews
                page: page
            };
            if (selectedGenre) params.genre_id = selectedGenre;

            const data = await ApiService.discoverMovies(params);
            setMovies(prev => {
                if (page === 1) return data.results;
                const newMovies = data.results.filter(newM => !prev.some(m => m.id === newM.id));
                return [...prev, ...newMovies];
            });
            setHasMore(data.page < data.total_pages);
        } catch (error) {
            console.error("Error discovering movies", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div className="title-section">
                    <h2>Films à Découvrir</h2>
                    <p className="subtitle">Les films dont tout le monde parle, pas seulement les mieux notés.</p>
                </div>
                <div className="discover-controls">
                    <div className="genre-selector">
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Tous les genres</option>
                            {genres.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="sort-selector">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="popularity.desc">Plus Populaires</option>
                            // Sort by vote count to see the most discussed ones
                            <option value="vote_count.desc">Plus de Critiques</option>
                            <option value="revenue.desc">Plus Gros Succès</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="movies-grid grid-5">
                {movies.map((movie, index) => (
                    <MovieCard
                        key={`${movie.id}-${index}`}
                        movie={movie}
                        onClick={() => onMovieClick(movie)}
                        onSelect={onMovieSelect}
                        isSelected={isMovieSelected(movie.id)}
                        isWatchLater={isWatchLater(movie.id)}
                        onToggleWatchLater={onToggleWatchLater}
                    />
                ))}
            </div>

            <div ref={sentinelRef} style={{ height: '20px' }}></div>

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

export default DiscoverPage;
