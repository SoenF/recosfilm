# 🎬 CinéMatch - Système de Recommandation de Films Moderne

Un système de recommandation de films complet utilisant des embeddings sémantiques modernes, FAISS pour la recherche vectorielle, et une interface React élégante.

![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20FAISS-blue)
![Python](https://img.shields.io/badge/Python-3.9%2B-green)
![React](https://img.shields.io/badge/React-18-blue)

## 🌟 Fonctionnalités

- ✨ **Recommandations Intelligentes**: Basées sur des embeddings sémantiques (SentenceTransformers)
- 🚀 **Recherche Ultra-Rapide**: FAISS pour la similarité vectorielle
- 🎨 **Interface Moderne**: React avec design dark premium
- 🔍 **Recherche de Films**: Intégration TMDB pour rechercher des films
- 📊 **Métadonnées Riches**: Genres, cast, réalisateur, synopsis, notes
- 🎯 **Profil Utilisateur**: Basé sur la moyenne des embeddings des films aimés
- 📱 **Responsive**: Design adaptatif desktop/tablette/mobile

## 🏗️ Architecture

```
FilmsReco/
├── backend/                 # API FastAPI + ML
│   ├── app/
│   │   ├── api/            # Endpoints REST
│   │   ├── core/           # Configuration
│   │   ├── models/         # Schémas Pydantic
│   │   ├── services/       # Logique métier
│   │   │   ├── tmdb_service.py          # API TMDB
│   │   │   ├── embedding_service.py     # Génération embeddings
│   │   │   ├── faiss_service.py         # Recherche vectorielle
│   │   │   └── recommendation_service.py # Orchestration
│   │   └── main.py
│   └── requirements.txt
│
└── frontend/               # Interface React
    ├── src/
    │   ├── components/
    │   │   ├── MovieCard.jsx
    │   │   ├── SearchBar.jsx
    │   │   └── SelectedMovies.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── index.css       # Design system
    └── package.json
```

## 📦 Stack Technique

### Backend
- **Framework**: FastAPI (async, haute performance)
- **ML/NLP**: SentenceTransformers (`all-MiniLM-L6-v2`)
- **Vector Store**: FAISS (IndexFlatIP)
- **Database**: SQLite (extensible à PostgreSQL)
- **API Externe**: TMDB API

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS (design system moderne)
- **HTTP Client**: Fetch API native
- **État**: React Hooks

## 🚀 Installation Rapide

### Prérequis

- Python 3.9+
- Node.js 18+
- Une clé API TMDB (gratuite)

### 1. Cloner le projet

```bash
cd /Users/soenflochlay/Desktop/PycharmProjects/FilmsReco
```

### 2. Backend Setup

```bash
cd backend

# Créer environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
# ou .venv\Scripts\activate  sur Windows

# Installer dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
# Éditer .env et ajouter votre clé TMDB
# TMDB_API_KEY=votre_clé_ici
```

**🔑 Obtenir une clé API TMDB**:
1. Créer un compte sur [themoviedb.org](https://www.themoviedb.org)
2. Aller dans Settings → API
3. Copier votre clé API
4. L'ajouter dans `backend/.env`

### 3. Frontend Setup

```bash
cd ../frontend

# Les dépendances sont déjà installées
# Sinon: npm install
```

### 4. Initialiser le Système

**Terminal 1 - Backend**:
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

Attendre que le serveur démarre, puis **initialiser la base de données**:

```bash
# Dans un autre terminal
curl -X POST "http://localhost:8000/api/initialize?num_movies=500"
```

⏱️ **Attention**: Cette opération prend 10-15 minutes (téléchargement de 500 films, génération des embeddings)

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### 5. Utiliser l'Application

Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur ! 🎉

## 🎯 Comment Utiliser

1. **Recherchez** des films que vous aimez dans la barre de recherche
2. **Cliquez** sur les films pour les sélectionner (3-5 recommandés)
3. **Cliquez** sur "Obtenir des recommandations"
4. **Découvrez** vos films recommandés avec score de similarité !

## 🧠 Comment ça Fonctionne

### 1. Génération des Embeddings

Pour chaque film, on crée un texte enrichi :

```python
text = f"""
{title}
Genres: {genres}
Overview: {overview}
Keywords: {keywords}
Cast: {top_5_cast}
Director: {director}
"""

embedding = model.encode(text, normalize_embeddings=True)
```

→ Vecteur de **384 dimensions** (all-MiniLM-L6-v2)

### 2. Profil Utilisateur

```python
user_profile = np.mean([film1_emb, film2_emb, film3_emb], axis=0)
user_profile = user_profile / np.linalg.norm(user_profile)  # Normalisation
```

### 3. Recherche de Similarité

```python
# FAISS avec Inner Product (= cosine similarity pour vecteurs normalisés)
distances, indices = faiss_index.search(user_profile, k=10)
```

→ Scores entre **0 et 1** (1 = identique)

## 📊 API Endpoints

### Recherche de Films
```http
GET /api/search?query=inception&page=1
```

### Recommandations
```http
POST /api/recommend
Content-Type: application/json

{
  "liked_movies": [550, 680, 13],
  "top_k": 10,
  "filters": {
    "genre": "Action",
    "min_rating": 7.0
  }
}
```

### Films Populaires
```http
GET /api/popular?page=1
```

### Statut du Système
```http
GET /api/status
```

### Détails d'un Film
```http
GET /api/movie/550
```

### Documentation Interactive
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🎨 Design

- **Thème**: Dark mode avec dégradés vibrants
- **Couleurs**: Palette cyan (#00d4ff) et violet (#7c3aed)
- **Typographie**: Inter (body) & Outfit (headers)
- **Animations**: Micro-interactions fluides
- **Responsive**: Mobile-first design

## ⚙️ Configuration Avancée

### Changer le Nombre de Films Initiaux

```bash
curl -X POST "http://localhost:8000/api/initialize?num_movies=1000"
```

### Modifier le Modèle d'Embedding

Dans `backend/.env`:
```env
EMBEDDING_MODEL_NAME=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

### Utiliser PostgreSQL

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/movies
```

## 📈 Performance

- **Recherche vectorielle**: < 10ms pour 1000 films
- **Génération de profil**: < 5ms
- **Endpoint /recommend**: ~15ms total
- **Embeddings**: Pré-calculés et mis en cache

## 🔧 Scripts Utiles

### Réinitialiser le système
```bash
rm -rf backend/data/*
curl -X POST "http://localhost:8000/api/initialize?num_movies=500"
```

### Tester l'API
```bash
# Statut
curl http://localhost:8000/api/status

# Recherche
curl "http://localhost:8000/api/search?query=matrix"

# Recommandations
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"liked_movies": [603, 13, 155]}'
```

## 🐛 Troubleshooting

### Backend ne démarre pas
- Vérifier que l'environnement virtuel est activé
- Vérifier que toutes les dépendances sont installées
- Vérifier que le port 8000 est libre

### Frontend ne se connecte pas au backend
- Vérifier que le backend tourne sur port 8000
- Vérifier l'URL dans `frontend/.env`
- Checker les erreurs CORS dans la console

### Pas de recommandations
- Vérifier que le système est initialisé: `GET /api/status`
- Vérifier que les films sélectionnés existent dans la DB
- Checker les logs du backend

### Erreur TMDB API
- Vérifier que la clé API est valide
- Vérifier la connectivité internet
- Respecter les limites de rate (40 req/10s)

## 📚 Ressources

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [SentenceTransformers](https://www.sbert.net/)
- [FAISS Wiki](https://github.com/facebookresearch/faiss/wiki)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

## 🚀 Améliorations Futures

- [ ] Cache Redis pour les requêtes fréquentes
- [ ] Support de filtres avancés (année, durée, etc.)
- [ ] Sauvegarde des profils utilisateurs
- [ ] Système de feedback (👍/👎)
- [ ] Re-ranking hybride (popularité + similarité)
- [ ] Support multilingue
- [ ] Mode sombre/clair toggle
- [ ] PWA (Progressive Web App)
- [ ] Tests unitaires et E2E
- [ ] CI/CD avec GitHub Actions
- [ ] Déploiement Docker

## 📄 Licence

Ce projet est à usage éducatif. Les données de films proviennent de TMDB.

## 👨‍💻 Développement

Créé avec ❤️ en utilisant les technologies modernes de ML et web development.

**Technologies utilisées**:
- Python 3.9+ | FastAPI | SentenceTransformers | FAISS | TMDB API
- React 18 | Vite | Modern CSS | Responsive Design

---

**Bon visionnage ! 🍿🎬**
