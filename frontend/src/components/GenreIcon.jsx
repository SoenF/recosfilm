
const GenreIcon = ({ genre }) => {
    // Basic mapping
    if (!genre) return null;

    // Direct mapping or fallback
    const getIconPath = (g) => {
        const lowerG = g.toLowerCase();

        if (lowerG.includes('action')) return <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />; // Lightning
        if (lowerG.includes('aventure')) return <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />; // Star
        if (lowerG.includes('animation')) return <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-5-8a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm8 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm-4 4a4 4 0 0 0 2.83-1.17 1 1 0 0 0-1.42-1.42 2 2 0 0 1-2.82 0 1 1 0 0 0-1.42 1.42A4 4 0 0 0 11 8z" />; // Happy Face
        if (lowerG.includes('comédie') || lowerG.includes('comedy')) return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />; // Laugh
        if (lowerG.includes('crime')) return <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />; // Shield
        if (lowerG.includes('documentaire')) return <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />; // Camera
        if (lowerG.includes('drame') || lowerG.includes('drama')) return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5zm4.5-6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />; // Dramatic Face
        if (lowerG.includes('familial') || lowerG.includes('family')) return <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />; // Family
        if (lowerG.includes('fantastique') || lowerG.includes('fantasy')) return <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L22 14l-2.5 1.4L18 19l-1.5-3.6L14 14l2.5-1.4L18 9zM11 9.3L13.1 14l4.7.6-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.6z" />; // Magic
        if (lowerG.includes('histoire') || lowerG.includes('history')) return <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />; // History
        if (lowerG.includes('horreur') || lowerG.includes('horror')) return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-9c.83 0 1.5-.67 1.5-1.5S10.33 8 9.5 8 8 8.67 8 9.5 8.67 11 9.5 11zm5 0c.83 0 1.5-.67 1.5-1.5S15.33 8 14.5 8 13 8.67 13 9.5s.67 1.5 1.5 1.5zm-2.5 5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />; // Horror
        if (lowerG.includes('musique') || lowerG.includes('music')) return <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />; // Music
        if (lowerG.includes('mystère') || lowerG.includes('mystery')) return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />; // Mystery
        if (lowerG.includes('romance')) return <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />; // Heart
        if (lowerG.includes('science') || lowerG.includes('sci-fi')) return <path d="M12 2.5s-2.5 3-2.5 5c0 2.5 2.5 4.5 2.5 4.5s2.5-2 2.5-4.5c0-2-2.5-5-2.5-5z M12 13c-3 0-5 2-5 5v3h10v-3c0-3-2-5-5-5z" />; // Rocket
        if (lowerG.includes('thriller')) return <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />; // Eye
        if (lowerG.includes('guerre') || lowerG.includes('war')) return <path d="M7.47 21.49l-1.1-1.1 5.63-5.63c-1.34-2.82-.4-6.26 2.22-7.85-1.33.17-2.73.57-4.02 1.3-1.67.94-2.75 2.62-3.23 4.5L5.7 12.2l-3.5-3.5 1.41-1.41 1.65 1.65c.57-2.54 2.23-4.8 4.67-6.18 3.09-1.76 6.85-1.42 9.49.52l5.63-5.63 1.1 1.1-18.68 22.74z" />; // Sword
        if (lowerG.includes('western')) return <path d="M12 2l2.3 5h5.3l-4.3 3.5 1.7 5.1-4.3-3.2-4.3 3.2 1.7-5.1-4.3-3.5h5.3z" />; // Star

        // Default to Drame/Drama icon for others
        return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5zm4.5-6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />;
    };

    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ pointerEvents: 'none' }}>
            {getIconPath(genre)}
        </svg>
    );
};

export default GenreIcon;
