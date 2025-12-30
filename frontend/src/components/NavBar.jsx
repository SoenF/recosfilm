import './NavBar.css';

function NavBar({ currentView, setView }) {
    const tabs = [
        { id: 'home', label: 'Accueil', shortLabel: 'Accueil' },
        { id: 'top-rated', label: 'Top Films', shortLabel: 'Top' },
        { id: 'discover', label: 'Découvrir', shortLabel: 'Découvrir' },
        { id: 'actors', label: 'Acteurs', shortLabel: 'Acteurs' },
        { id: 'watch-later', label: 'À regarder plus tard', shortLabel: 'Plus tard' }
    ];

    return (
        <nav className="nav-bar">
            <ul>
                {tabs.map(tab => (
                    <li key={tab.id} className={currentView === tab.id ? 'active' : ''}>
                        <button onClick={() => setView(tab.id)}>
                            <span className="tab-full">{tab.label}</span>
                            <span className="tab-short">{tab.shortLabel}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default NavBar;
