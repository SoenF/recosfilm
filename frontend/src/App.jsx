import { useState, useEffect, useCallback, useRef } from 'react';
import ApiService from './services/api';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import SelectedMovies from './components/SelectedMovies';
import MovieDetailsModal from './components/MovieDetailsModal';
import NavBar from './components/NavBar';
import TopRatedPage from './components/TopRatedPage';
import ActorPage from './components/ActorPage';
import WatchLaterPage from './components/WatchLaterPage';
import DiscoverPage from './components/DiscoverPage';
import GenreLegend from './components/GenreLegend';
import './App.css';

function App() {
    const [currentView, setCurrentView] = useState('home');
    const [movies, setMovies] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [viewingMovie, setViewingMovie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [systemStatus, setSystemStatus] = useState(null);
    // Hide intro by default on mobile
    const [showIntro, setShowIntro] = useState(window.innerWidth > 768);
    const [showLegend, setShowLegend] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [watchLater, setWatchLater] = useState([]);
    const [headerHidden, setHeaderHidden] = useState(false);
    const lastScrollY = useCallback((node) => {
        if (node !== null) {
            // This is a dummy ref callback usage? No, useRef is better for value storage
        }
    }, []);

    // Use a ref for lastScrollY to avoid re-renders just for tracking position
    const lastScrollPos = useRef(0);

    const [filters, setFilters] = useState({});

    // Check system status on mount
    useEffect(() => {
        checkSystemStatus();

        // Load watch later from local storage
        const saved = localStorage.getItem('watchLater');
        if (saved) {
            try {
                setWatchLater(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading watch later", e);
            }
        }
    }, []);

    // Save watch later to local storage
    useEffect(() => {
        localStorage.setItem('watchLater', JSON.stringify(watchLater));
    }, [watchLater]);

    // Load popular movies on mount
    useEffect(() => {
        if (systemStatus?.embeddings_ready) {
            loadPopularMovies();
        }
    }, [systemStatus]);

    // Handle scroll for header
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Background transparency logic
            if (currentScrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            // Hide/Show logic
            if (currentScrollY > lastScrollPos.current && currentScrollY > 100) {
                setHeaderHidden(true); // Scrolling down
            } else {
                setHeaderHidden(false); // Scrolling up
            }

            lastScrollPos.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const checkSystemStatus = async () => {
        try {
            const status = await ApiService.getStatus();
            setSystemStatus(status);

            if (!status.embeddings_ready || !status.faiss_index_ready) {
                setError({
                    type: 'system_not_ready',
                    message: 'Le système n\'est pas encore initialisé. Veuillez lancer le backend et initialiser la base de données.',
                });
            }
        } catch (err) {
            setError({
                type: 'connection_error',
                message: `Impossible de se connecter au serveur backend (${import.meta.env.VITE_API_URL || 'localhost'}). Vérifiez la connexion.`,
            });
        }
    };

    const loadPopularMovies = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getPopularMovies(1);
            setMovies(data.results);
            setError(null);
        } catch (err) {
            setError({
                type: 'load_error',
                message: 'Erreur lors du chargement des films populaires',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback(async (query) => {
        if (currentView !== 'home') setCurrentView('home');
        try {
            setLoading(true);
            const data = await ApiService.searchMovies(query);
            setMovies(data.results);
            setError(null);
        } catch (err) {
            setError({
                type: 'search_error',
                message: 'Erreur lors de la recherche',
            });
        } finally {
            setLoading(false);
        }
    }, [currentView]);

    const handleClearSearch = useCallback(() => {
        loadPopularMovies();
    }, []);

    const handleMovieClick = (movie) => {
        // In Home view, click selects the movie
        setSelectedMovies((prev) => {
            const isSelected = prev.some((m) => m.id === movie.id);

            if (isSelected) {
                return prev.filter((m) => m.id !== movie.id);
            } else {
                return [...prev, { ...movie, userRating: 5 }];
            }
        });
    };

    const handleUpdateRating = (movieId, rating) => {
        setSelectedMovies((prev) =>
            prev.map((m) => (m.id === movieId ? { ...m, userRating: parseFloat(rating) } : m))
        );
    };

    const handleRemoveSelected = (movieId) => {
        setSelectedMovies((prev) => prev.filter((m) => m.id !== movieId));
    };

    const handleGetRecommendations = async () => {
        if (selectedMovies.length === 0) return;

        try {
            setLoading(true);
            setShowIntro(false);
            console.log("Requesting recommendations for:", selectedMovies); // Debug log

            const payload = selectedMovies.map((m) => ({
                movie_id: m.id,
                rating: m.userRating !== undefined ? Number(m.userRating) : 5.0
            }));

            const data = await ApiService.getRecommendations(
                payload,
                20,
                filters
            );
            setRecommendations(data.recommendations);
            setError(null);

            // Scroll to recommendations
            setTimeout(() => {
                document.getElementById('recommendations')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        } catch (err) {
            console.error("Recommendation error details:", err);
            setError({
                type: 'recommendation_error',
                message: err.message || 'Erreur lors de la génération des recommandations',
            });
        } finally {
            setLoading(false);
        }
    };

    const isMovieSelected = (movieId) => {
        return selectedMovies.some((m) => m.id === movieId);
    };

    const isMovieInWatchLater = (movieId) => {
        return watchLater.some((m) => m.id === movieId);
    };

    const toggleWatchLater = async (movie) => {
        setWatchLater(prev => {
            const exists = prev.some(m => m.id === movie.id);
            if (exists) {
                return prev.filter(m => m.id !== movie.id);
            } else {
                return [...prev, movie];
            }
        });

        // If the movie doesn't have runtime/cast, fetch details to make filters useful
        if (!movie.runtime || !movie.cast) {
            try {
                const details = await ApiService.getMovieDetails(movie.id);
                setWatchLater(prev => prev.map(m => m.id === movie.id ? { ...m, ...details } : m));
            } catch (e) {
                console.error("Failed to fetch details for watch later", e);
            }
        }
    };

    const renderHome = () => (
        <>
            {/* Intro Section - Collapsible */}
            {showIntro && (
                <section className="intro-section fade-in">
                    <div className="intro-toggle" onClick={() => setShowIntro(false)}>
                        <h2>Comment ça marche ?</h2>
                        <button className="collapse-btn" aria-label="Masquer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Recherchez</h3>
                            <p>Trouvez des films que vous aimez en utilisant la barre de recherche</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Sélectionnez</h3>
                            <p>Cliquez sur les films pour les ajouter à votre profil</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Découvrez</h3>
                            <p>Obtenez des recommandations personnalisées basées sur l'IA</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Show intro button when collapsed */}
            {!showIntro && (
                <button className="show-intro-btn" onClick={() => setShowIntro(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Comment ça marche ?
                </button>
            )}

            {/* Legend Section */}
            {showLegend ? (
                <section className="intro-section fade-in" style={{ marginTop: '1rem' }}>
                    <div className="intro-toggle" onClick={() => setShowLegend(false)}>
                        <h2>Légende des genres</h2>
                        <button className="collapse-btn" aria-label="Masquer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <GenreLegend />
                </section>
            ) : (
                <button className="show-intro-btn" onClick={() => setShowLegend(true)} style={{ marginTop: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Légende des genres
                </button>
            )}

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

            {/* Selected Movies */}
            <SelectedMovies
                movies={selectedMovies}
                filters={filters}
                onFilterChange={setFilters}
                onRemove={handleRemoveSelected}
                onUpdateRating={handleUpdateRating}
                onGetRecommendations={handleGetRecommendations}
                onViewMovie={(movie) => setViewingMovie(movie)}
            />

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <section id="recommendations" className="recommendations-section fade-in">
                    <div className="section-header">
                        <div>
                            <h2>Recommandations pour vous</h2>
                            <p className="section-subtitle">
                                Basées sur vos {selectedMovies.length} films sélectionnés
                            </p>
                        </div>
                        <div className="section-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setRecommendations([]);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                Modifier ma recherche
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setRecommendations([]);
                                    setSelectedMovies([]);
                                }}
                            >
                                Tout effacer
                            </button>
                        </div>
                    </div>

                    <div className="movies-grid grid-5">
                        {recommendations.map((movie) => {
                            const normalizedMovie = {
                                ...movie,
                                id: movie.movie_id
                            };
                            return (
                                <MovieCard
                                    key={normalizedMovie.id}
                                    movie={normalizedMovie}
                                    showScore={true}
                                    isSelected={isMovieSelected(normalizedMovie.id)}
                                    onSelect={() => handleMovieClick(normalizedMovie)}
                                    onClick={() => setViewingMovie(normalizedMovie)}
                                    isWatchLater={isMovieInWatchLater(normalizedMovie.id)}
                                    onToggleWatchLater={() => toggleWatchLater(normalizedMovie)}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Browse Movies */}
            {recommendations.length === 0 && (
                <section className="browse-section">
                    <h2>{recommendations.length > 0 ? 'Explorer plus de films' : 'Films populaires'}</h2>

                    {loading ? (
                        <div className="movies-grid grid-5">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="movie-card-skeleton">
                                    <div className="skeleton skeleton-poster"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton skeleton-title"></div>
                                        <div className="skeleton skeleton-meta"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="movies-grid grid-5">
                            {movies.map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    isSelected={isMovieSelected(movie.id)}
                                    onSelect={() => handleMovieClick(movie)}
                                    onClick={() => setViewingMovie(movie)}
                                    isWatchLater={isMovieInWatchLater(movie.id)}
                                    onToggleWatchLater={() => toggleWatchLater(movie)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </>
    );

    return (
        <div className="app">
            {/* Header */}
            <header className={`app-header ${scrolled ? 'scrolled' : ''} ${headerHidden ? 'header-hidden' : ''}`}>
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section" onClick={() => setCurrentView('home')} style={{ cursor: 'pointer' }}>
                            <div className="logo-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" />
                                    <path d="M3 8H21" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="7" cy="12" r="1" fill="currentColor" />
                                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                                    <circle cx="17" cy="12" r="1" fill="currentColor" />
                                </svg>
                            </div>
                            <div>
                                <h1>RecoFilms</h1>
                                <p className="tagline">Découvrez vos prochains films préférés</p>
                            </div>
                        </div>

                        {systemStatus && (
                            <div className="status-badge">
                                <div className={`status-indicator ${systemStatus.embeddings_ready ? 'active' : 'inactive'}`}></div>
                                <span>{systemStatus.total_movies} films indexés</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <NavBar currentView={currentView} setView={setCurrentView} />

            {/* Main Content */}
            <main className="container">
                {/* Error Display */}
                {error && (
                    <div className={`alert alert-${error.type === 'connection_error' ? 'error' : 'warning'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div>
                            <strong>{error.type === 'connection_error' ? 'Erreur de connexion' : 'Attention'}</strong>
                            <p>{error.message}</p>
                        </div>
                    </div>
                )}

                {currentView === 'home' && renderHome()}

                {currentView === 'top-rated' && (
                    <TopRatedPage
                        onMovieClick={(movie) => setViewingMovie(movie)}
                        onMovieSelect={handleMovieClick}
                        isMovieSelected={isMovieSelected}
                        viewingMovie={viewingMovie}
                        setViewingMovie={setViewingMovie}
                        isWatchLater={isMovieInWatchLater}
                        onToggleWatchLater={toggleWatchLater}
                    />
                )}

                {currentView === 'watch-later' && (
                    <WatchLaterPage
                        watchLaterMovies={watchLater}
                        onRemoveWatchLater={(id) => setWatchLater(prev => prev.filter(m => m.id !== id))}
                        onMovieClick={(movie) => setViewingMovie(movie)}
                        onMovieSelect={handleMovieClick}
                        isMovieSelected={isMovieSelected}
                    />
                )}

                {currentView === 'discover' && (
                    <DiscoverPage
                        onMovieClick={(movie) => setViewingMovie(movie)}
                        onMovieSelect={handleMovieClick}
                        isMovieSelected={isMovieSelected}
                        isWatchLater={isMovieInWatchLater}
                        onToggleWatchLater={toggleWatchLater}
                    />
                )}

                {currentView === 'actors' && (
                    <ActorPage
                        onMovieClick={(movie) => setViewingMovie(movie)}
                        onMovieSelect={handleMovieClick}
                        isMovieSelected={isMovieSelected}
                        isWatchLater={isMovieInWatchLater}
                        onToggleWatchLater={toggleWatchLater}
                    />
                )}
            </main>

            {/* Modal */}
            {viewingMovie && (
                <MovieDetailsModal
                    movie={viewingMovie}
                    onClose={() => setViewingMovie(null)}
                />
            )}

            {/* Footer */}
            <footer className="app-footer">
                <div className="container">
                    <p>
                        Propulsé par{' '}
                        <strong>SentenceTransformers</strong> & <strong>FAISS</strong>
                    </p>
                    <p className="footer-meta">
                        Données fournies par <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
