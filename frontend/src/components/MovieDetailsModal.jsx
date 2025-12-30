import { useEffect, useRef, useState } from 'react';
import ApiService from '../services/api';
import './MovieDetailsModal.css';

function MovieDetailsModal({ movie, onClose }) {
    const modalRef = useRef(null);
    const [details, setDetails] = useState(movie);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    useEffect(() => {
        const fetchDetails = async () => {
            // If we don't have cast OR runtime, we need to fetch details
            // We check 'details' state instead of 'movie' prop to avoid re-fetching after we got them
            if (!details.cast || !details.runtime) {
                setIsLoadingDetails(true);
                try {
                    const fullDetails = await ApiService.getMovieDetails(movie.id);
                    setDetails(prev => ({ ...prev, ...fullDetails }));
                } catch (error) {
                    console.error("Failed to fetch full movie details", error);
                } finally {
                    setIsLoadingDetails(false);
                }
            }
        };

        fetchDetails();
    }, [movie.id, details.cast, details.runtime]);

    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const posterUrl = details.poster_path || details.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
    const score = details.score ? (details.score * 100).toFixed(0) : null;

    const formatRuntime = (minutes) => {
        if (!minutes) return null;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" ref={modalRef}>
                <button className="modal-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="modal-grid">
                    <div className="modal-poster">
                        <img src={posterUrl} alt={details.title} />
                    </div>

                    <div className="modal-info">
                        <h2 className="modal-title">{details.title}</h2>

                        <div className="modal-meta">
                            {details.release_date && (
                                <span className="modal-year">{new Date(details.release_date).getFullYear()}</span>
                            )}

                            {details.runtime > 0 && (
                                <span className="modal-runtime">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                    {formatRuntime(details.runtime)}
                                </span>
                            )}

                            {details.vote_average > 0 && (
                                <span className="modal-rating" title="Note TMDB">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ marginRight: '4px', color: 'var(--rating-medium)' }}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    {details.vote_average.toFixed(1)}/10
                                </span>
                            )}

                            {score && (
                                <span className="modal-score">{score}% match</span>
                            )}
                        </div>

                        {details.genres && (
                            <div className="modal-genres">
                                {details.genres.map((g, i) => (
                                    <span key={i} className="genre-badge">{g}</span>
                                ))}
                            </div>
                        )}

                        <div className="modal-section">
                            <h3>Synopsis</h3>
                            <p className="modal-overview">{details.overview || "Aucun résumé disponible."}</p>
                        </div>

                        {/* Cast Section */}
                        {details.cast && details.cast.length > 0 && (
                            <div className="modal-section">
                                <h3>Acteurs principaux</h3>
                                <div className="modal-cast">
                                    {details.cast.slice(0, 10).map((actor, index) => (
                                        <span key={index} className="cast-member">
                                            {actor}{index < Math.min(details.cast.length, 10) - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Director */}
                        {details.director && (
                            <div className="modal-section">
                                <h3>Réalisateur</h3>
                                <p>{details.director}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieDetailsModal;
