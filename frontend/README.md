# 🎬 RecoFilms - Frontend React

Frontend moderne pour le système de recommandation de films RecoFilms.

## 🎨 Design

- **Framework**: React + Vite
- **Styling**: Vanilla CSS avec design system moderne
- **Thème**: Dark mode avec dégradés vibrants et glassmorphism
- **Typographie**: Inter & Outfit (Google Fonts)
- **Animations**: Micro-interactions fluides

## 🚀 Installation

```bash
cd frontend
npm install
```

## ⚙️ Configuration

Le fichier `.env` contient l'URL de l'API:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🎯 Lancement

### Mode développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Build de production

```bash
npm run build
```

### Preview du build

```bash
npm run preview
```

## 📁 Structure

```
src/
├── components/          # Composants React
│   ├── MovieCard.jsx   # Carte de film
│   ├── SearchBar.jsx   # Barre de recherche
│   └── SelectedMovies.jsx  # Films sélectionnés
│
├── services/           # Services API
│   └── api.js         # Client API
│
├── App.jsx            # Composant principal
├── App.css            # Styles principaux
├── index.css          # Design system
└── main.jsx           # Point d'entrée
```

## 🎨 Design System

### Couleurs

```css
--bg-primary: #0f0f23       /* Fond principal */
--bg-secondary: #1a1a2e     /* Fond secondaire */
--bg-card: #16213e          /* Fond des cartes */

--accent-primary: #00d4ff   /* Cyan vibrant */
--accent-secondary: #7c3aed /* Violet */

--text-primary: #ffffff     /* Texte principal */
--text-secondary: #b3b3b3   /* Texte secondaire */
```

### Composants

- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`
- **Cards**: `.card` avec effets hover
- **Inputs**: `.input` avec focus states
- **Grids**: `.grid`, `.grid-2` à `.grid-5`
- **Badges**: `.badge`, `.badge-primary`

## 🔧 Fonctionnalités

### Recherche de Films

- Barre de recherche avec debouncing (500ms)
- Icônes de recherche et de clear
- Loading spinner pendant la recherche

### Sélection de Films

- Clic pour sélectionner/désélectionner
- Badge visuel sur les films sélectionnés
- Section dédiée avec compteur

### Recommandations

- Bouton pour générer les recommandations
- Affichage du score de similarité
- Section mise en évidence avec glow effect

### UI/UX

- **Responsive**: Desktop, tablette, mobile
- **Animations**: fadeIn, slide, pulse
- **Loading states**: Skeletons pour le chargement
- **Error handling**: Alertes visuelles
- **Smooth scroll**: Navigation fluide

## 📱 Responsive Breakpoints

```css
Desktop: > 1200px
Tablet:  768px - 1200px
Mobile:  < 768px
Small:   < 480px
```

## 🎬 Workflow Utilisateur

1. **Découvrir**: Films populaires affichés par défaut
2. **Rechercher**: Chercher des films spécifiques
3. **Sélectionner**: Cliquer pour ajouter aux favoris
4. **Recommander**: Générer des suggestions IA
5. **Explorer**: Parcourir les recommandations

## 🚀 Performance

- **Code splitting**: Import dynamique des composants
- **Lazy loading**: Images en lazy
- **Optimisations Vite**: Build optimisé
- **CSS moderne**: Variables CSS natives
- **Debouncing**: Recherche optimisée

## 🔗 Connexion Backend

Le frontend communique avec le backend FastAPI via:

- `GET /api/search` - Recherche de films
- `GET /api/popular` - Films populaires
- `POST /api/recommend` - Recommandations
- `GET /api/status` - Statut du système

## 🎨 Personnalisation

Pour modifier le thème, éditez les variables CSS dans `src/index.css`:

```css
:root {
  --accent-primary: #your-color;
  --bg-primary: #your-background;
  /* ... */
}
```

## 📦 Build

Le build de production génère:

```
dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── index.html
```

Déploiement possible sur:
- Vercel
- Netlify
- GitHub Pages
- Tout hébergeur statique

## 🐛 Debug

### Problèmes courants

**Backend non accessible**:
- Vérifier que le backend tourne sur port 8000
- Vérifier l'URL dans `.env`

**CORS errors**:
- Backend configuré pour accepter `localhost:5173`
- Vérifier `settings.CORS_ORIGINS` dans le backend

**Recherche ne fonctionne pas**:
- Vérifier que le système backend est initialisé
- Checker le statut avec GET `/api/status`

## 🌟 Améliorations Futures

- [ ] Filtres avancés (genre, année, note)
- [ ] Pagination des résultats
- [ ] Sauvegarde du profil utilisateur (localStorage)
- [ ] Mode clair/sombre toggle
- [ ] Animations de transition entre vues
- [ ] PWA support
- [ ] Internationalisation (i18n)
