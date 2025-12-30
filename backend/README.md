# 🎬 Movie Recommendation Backend

Backend API moderne pour un système de recommandation de films basé sur des embeddings sémantiques.

## 🏗️ Architecture

### Stack Technique

- **Framework**: FastAPI (async, haute performance)
- **ML/NLP**: SentenceTransformers (`all-MiniLM-L6-v2`)
- **Vector Search**: FAISS (Facebook AI Similarity Search)
- **Database**: SQLite (extensible à PostgreSQL)
- **APIs Externes**: TMDB API

### Composants Principaux

```
app/
├── api/              # Endpoints REST
├── core/             # Configuration
├── models/           # Schémas Pydantic
└── services/         # Logique métier
    ├── tmdb_service.py          # Interaction TMDB
    ├── embedding_service.py     # Génération embeddings
    ├── faiss_service.py         # Recherche vectorielle
    └── recommendation_service.py # Orchestration
```

## 🚀 Installation

### 1. Créer un environnement virtuel

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Sur Mac/Linux
# OU
.venv\Scripts\activate  # Sur Windows
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configuration

Créer un fichier `.env` à partir de `.env.example`:

```bash
cp .env.example .env
```

**IMPORTANT**: Obtenir une clé API TMDB:
1. Créer un compte sur [themoviedb.org](https://www.themoviedb.org)
2. Aller dans Settings → API
3. Copier votre clé API Bearer Token
4. Ajouter dans `.env`:

```env
TMDB_API_KEY=votre_clé_api_ici
```

## 🎯 Utilisation

### Démarrer le serveur

```bash
python -m uvicorn app.main:app --reload
```

Le serveur démarre sur `http://localhost:8000`

### Documentation Interactive

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Initialisation du système

**PREMIÈRE UTILISATION** - Initialiser la base de données vectorielle:

```bash
# Via curl
curl -X POST "http://localhost:8000/api/initialize?num_movies=500"

# Ou depuis l'interface Swagger
```

Cette opération:
- Récupère 500 films populaires depuis TMDB
- Génère leurs métadonnées (genres, synopsis, cast, etc.)
- Crée les embeddings sémantiques
- Construit l'index FAISS
- Sauvegarde tout sur disque

⏱️ Durée estimée: 10-15 minutes pour 500 films

## 📡 Endpoints API

### 🔍 Recherche de films

```http
GET /api/search?query=inception&page=1
```

### 🎯 Recommandations

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

### 📊 Détails d'un film

```http
GET /api/movie/550
```

### 🌟 Films populaires

```http
GET /api/popular?page=1
```

### ⚙️ Statut du système

```http
GET /api/status
```

## 🧠 Comment ça marche ?

### 1. Génération des Embeddings

Pour chaque film, on crée un texte enrichi:

```python
text = f"""
{title}
Genres: {genres}
Overview: {overview}
Keywords: {keywords}
Cast: {top_5_cast}
Director: {director}
"""
```

Ce texte est transformé en vecteur 384D par SentenceTransformer.

### 2. Profil Utilisateur

Le profil utilisateur = **moyenne** des embeddings des films aimés:

```python
user_profile = np.mean([emb1, emb2, emb3], axis=0)
```

### 3. Recherche de Similarité

FAISS fait une recherche par produit scalaire (cosine similarity sur vecteurs normalisés):

```python
distances, indices = index.search(user_profile, k=10)
```

Les scores sont entre 0 et 1 (1 = identique).

## 📁 Structure des Données

Après initialisation, un dossier `data/` est créé:

```
data/
├── embeddings.npy          # Vecteurs des films
├── movies_metadata.json    # Métadonnées complètes
└── faiss_index.bin        # Index FAISS
```

Ces fichiers sont chargés au démarrage pour des performances optimales.

## 🔧 Configuration Avancée

### Modifier le modèle d'embedding

Dans `.env`:

```env
EMBEDDING_MODEL_NAME=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
EMBEDDING_DIMENSION=384
```

### Utiliser PostgreSQL

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/movies
```

## 🐛 Debugging

### Logs

Les logs sont affichés dans la console. Niveau: INFO

### Vérifier le statut

```bash
curl http://localhost:8000/api/status
```

Réponse:
```json
{
  "status": "healthy",
  "total_movies": 500,
  "embeddings_ready": true,
  "faiss_index_ready": true
}
```

## 🚀 Performance

- **Recherche**: < 10ms pour 1000 films
- **Génération de profil**: < 5ms
- **Endpoint /recommend**: ~15ms total

Optimisations:
- Embeddings pré-calculés et mis en cache
- Index FAISS en mémoire
- Normalisation des vecteurs pour produit scalaire rapide

## 📚 Ressources

- [TMDB API Docs](https://developers.themoviedb.org/3)
- [SentenceTransformers](https://www.sbert.net/)
- [FAISS](https://github.com/facebookresearch/faiss)
- [FastAPI](https://fastapi.tiangolo.com/)

## 🔜 Améliorations Futures

- [ ] Cache Redis pour les requêtes fréquentes
- [ ] Rate limiting avec slowapi
- [ ] Support de plusieurs profils utilisateurs
- [ ] Re-ranking hybride (popularité + similarité)
- [ ] Feedback loop (👍/👎)
- [ ] A/B testing de modèles
