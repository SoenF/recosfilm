# 📁 Structure du Projet CinéMatch

```
FilmsReco/
│
├── 📄 README.md                    # Documentation principale
├── 📄 QUICKSTART.md                # Guide démarrage rapide
├── 📄 ARCHITECTURE.md              # Documentation technique
├── 📄 COMMANDS.md                  # Référence des commandes
├── 📄 .gitignore                   # Fichiers à ignorer
├── 🐳 docker-compose.yml           # Configuration Docker (bonus)
├── 🧪 test_api.sh                  # Script de test API
│
├── 🔧 backend/                     # API FastAPI + ML
│   │
│   ├── 📄 README.md                # Doc backend
│   ├── 📄 requirements.txt         # Dépendances Python
│   ├── 📄 .env                     # Variables d'environnement (à créer)
│   ├── 📄 .env.example             # Template des variables
│   ├── 📄 .gitignore               # Ignores backend
│   ├── 🐳 Dockerfile               # Image Docker backend
│   ├── 🔧 init_system.py           # Script d'initialisation
│   │
│   ├── 📂 app/                     # Application principale
│   │   │
│   │   ├── 📄 __init__.py
│   │   ├── 📄 main.py              # Point d'entrée FastAPI
│   │   │
│   │   ├── 📂 core/                # Configuration
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 config.py        # Settings Pydantic
│   │   │
│   │   ├── 📂 models/              # Schémas de données
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 schemas.py       # Modèles Pydantic
│   │   │
│   │   ├── 📂 api/                 # Endpoints REST
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 routes.py        # Routes API
│   │   │
│   │   └── 📂 services/            # Logique métier
│   │       ├── 📄 __init__.py
│   │       ├── 📄 tmdb_service.py          # API TMDB
│   │       ├── 📄 embedding_service.py     # Génération embeddings
│   │       ├── 📄 faiss_service.py         # Recherche vectorielle
│   │       └── 📄 recommendation_service.py # Orchestration
│   │
│   └── 📂 data/                    # Données générées (après init)
│       ├── 📊 embeddings.npy       # Vecteurs des films
│       ├── 🔍 faiss_index.bin      # Index FAISS
│       └── 📋 movies_metadata.json # Métadonnées complètes
│
└── 🎨 frontend/                    # Interface React
    │
    ├── 📄 README.md                # Doc frontend
    ├── 📄 package.json             # Dépendances Node
    ├── 📄 package-lock.json        # Lock file
    ├── 📄 vite.config.js           # Config Vite
    ├── 📄 .env                     # Variables frontend
    ├── 🐳 Dockerfile               # Image Docker frontend
    ├── 📄 index.html               # Template HTML
    │
    └── 📂 src/                     # Code source
        │
        ├── 📄 main.jsx             # Point d'entrée React
        ├── 📄 App.jsx              # Composant principal
        ├── 📄 App.css              # Styles App
        ├── 📄 index.css            # Design System global
        │
        ├── 📂 components/          # Composants React
        │   │
        │   ├── 🎬 MovieCard.jsx    # Carte de film
        │   ├── 📄 MovieCard.css    # Styles carte
        │   │
        │   ├── 🔍 SearchBar.jsx    # Barre de recherche
        │   ├── 📄 SearchBar.css    # Styles recherche
        │   │
        │   ├── ⭐ SelectedMovies.jsx # Films sélectionnés
        │   └── 📄 SelectedMovies.css # Styles sélection
        │
        └── 📂 services/            # Services API
            └── 📡 api.js           # Client API backend
```

## 📊 Statistiques du Projet

### Backend (Python)
- **Fichiers Python**: 10
- **Lines of Code**: ~1,200
- **Services**: 4 (TMDB, Embedding, FAISS, Recommendation)
- **API Endpoints**: 7
- **Dépendances**: 13 packages

### Frontend (React)
- **Fichiers React**: 4 components
- **Fichiers CSS**: 4
- **Lines of Code**: ~600
- **Services**: 1 (API client)
- **Dépendances**: ~20 packages (via Vite)

### Documentation
- **Fichiers Markdown**: 7
- **Total Pages**: ~40 pages équivalent
- **Guides**: Installation, Quick Start, Architecture, Commands

## 🔑 Fichiers Clés

### Backend

| Fichier | Rôle | Importance |
|---------|------|------------|
| `app/main.py` | Point d'entrée FastAPI, configuration CORS | ⭐⭐⭐⭐⭐ |
| `app/services/recommendation_service.py` | Orchestration des recommandations | ⭐⭐⭐⭐⭐ |
| `app/services/embedding_service.py` | Génération des embeddings sémantiques | ⭐⭐⭐⭐⭐ |
| `app/services/faiss_service.py` | Recherche par similarité vectorielle | ⭐⭐⭐⭐⭐ |
| `app/services/tmdb_service.py` | Intégration API TMDB | ⭐⭐⭐⭐ |
| `app/api/routes.py` | Définition des endpoints REST | ⭐⭐⭐⭐ |
| `app/core/config.py` | Configuration centralisée | ⭐⭐⭐ |
| `app/models/schemas.py` | Validation des données | ⭐⭐⭐ |

### Frontend

| Fichier | Rôle | Importance |
|---------|------|------------|
| `src/App.jsx` | Composant principal, gestion d'état | ⭐⭐⭐⭐⭐ |
| `src/services/api.js` | Client API pour le backend | ⭐⭐⭐⭐⭐ |
| `src/index.css` | Design system, variables CSS | ⭐⭐⭐⭐ |
| `src/components/MovieCard.jsx` | Affichage des films | ⭐⭐⭐⭐ |
| `src/components/SearchBar.jsx` | Recherche de films | ⭐⭐⭐ |
| `src/components/SelectedMovies.jsx` | Films sélectionnés | ⭐⭐⭐ |

## 📦 Données Générées

Après initialisation, le dossier `backend/data/` contient :

```
data/
├── embeddings.npy              # ~7.5 MB pour 500 films
│                               # (500 × 384 × 4 bytes)
│
├── faiss_index.bin             # ~7.5 MB
│                               # Index FAISS avec vecteurs
│
└── movies_metadata.json        # ~2-3 MB
                                # Métadonnées complètes JSON
```

**Taille totale**: ~15-18 MB pour 500 films

## 🔄 Flux de Fichiers

### Initialisation
```
1. Script init_system.py
   │
   ▼
2. TMDB API → movies_metadata.json
   │
   ▼
3. SentenceTransformer → embeddings.npy
   │
   ▼
4. FAISS → faiss_index.bin
```

### Runtime
```
1. Frontend (index.html)
   │
   ▼
2. React App (App.jsx)
   │
   ▼
3. API Service (api.js)
   │
   ▼
4. Backend (routes.py)
   │
   ▼
5. Services (recommendation_service.py, etc.)
   │
   ▼
6. Data (embeddings.npy, faiss_index.bin)
```

## 🎯 Points d'Extension

Pour ajouter des fonctionnalités, modifier ces fichiers :

### 1. Nouveau Endpoint API
- Ajouter dans `backend/app/api/routes.py`
- Créer le schéma dans `backend/app/models/schemas.py`
- Implémenter la logique dans un service

### 2. Nouveau Composant Frontend
- Créer `frontend/src/components/NouveauComposant.jsx`
- Créer `frontend/src/components/NouveauComposant.css`
- Importer dans `frontend/src/App.jsx`

### 3. Nouvelle Source de Données
- Créer un nouveau service dans `backend/app/services/`
- Suivre le pattern de `tmdb_service.py`

### 4. Modifications du Design
- Modifier `frontend/src/index.css` pour les variables globales
- Modifier les fichiers `.css` spécifiques pour les composants

## 🔐 Fichiers Sensibles

⚠️ **NE JAMAIS COMMITTER**:
- `backend/.env` (contient TMDB_API_KEY)
- `backend/data/*` (trop volumineux)
- `.venv/` (environnement virtuel)
- `node_modules/` (dépendances Node)

✅ **Utiliser `.gitignore`** pour les protéger automatiquement.

---

**Total**: ~60 fichiers (hors node_modules, .venv, caches)
**Langages**: Python, JavaScript, CSS, Markdown
**Frameworks**: FastAPI, React, Vite
**ML**: SentenceTransformers, FAISS
