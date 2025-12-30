import React from 'react';
import GenreIcon from './GenreIcon';

const genres = [
    'Action', 'Aventure', 'Animation', 'Comédie', 'Crime',
    'Documentaire', 'Drame', 'Familial', 'Fantastique', 'Histoire',
    'Horreur', 'Musique', 'Mystère', 'Romance', 'Science-Fiction',
    'Thriller', 'Guerre', 'Western'
];

const GenreLegend = () => {
    return (
        <div className="genre-legend fade-in">
            <h4>Légende des genres</h4>
            <div className="legend-grid">
                {genres.map(genre => (
                    <div key={genre} className="legend-item">
                        <span className="legend-icon">
                            <GenreIcon genre={genre} />
                        </span>
                        <span className="legend-label">{genre}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenreLegend;
