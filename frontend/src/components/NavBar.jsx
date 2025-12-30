import './NavBar.css';

function NavBar({ currentView, setView }) {
    return (
        <nav className="nav-bar">
            <ul>
                <li className={currentView === 'home' ? 'active' : ''}>
                    <button onClick={() => setView('home')}>Accueil</button>
                </li>
                <li className={currentView === 'top-rated' ? 'active' : ''}>
                    <button onClick={() => setView('top-rated')}>Top Films</button>
                </li>
                <li className={currentView === 'discover' ? 'active' : ''}>
                    <button onClick={() => setView('discover')}>Découvrir</button>
                </li>
                <li className={currentView === 'actors' ? 'active' : ''}>
                    <button onClick={() => setView('actors')}>Acteurs</button>
                </li>
                <li className={currentView === 'watch-later' ? 'active' : ''}>
                    <button onClick={() => setView('watch-later')}>À regarder plus tard</button>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;
