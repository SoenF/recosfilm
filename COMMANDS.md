# 📝 Commandes Essentielles - CinéMatch

Guide de référence rapide pour toutes les commandes importantes.

## 🚀 Installation & Démarrage

### Installation Initiale

```bash
# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Ajouter votre clé TMDB dans .env
echo "TMDB_API_KEY=votre_clé_ici" > .env
cat .env.example >> .env

# Frontend
cd ../frontend
# npm install déjà fait par create-vite
```

### Démarrer les Services

```bash
# Terminal 1 - Backend
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Initialiser la Base de Données

```bash
# Option 1: Via API (recommandé)
curl -X POST "http://localhost:8000/api/initialize?num_movies=500"

# Option 2: Via script Python
cd backend
source .venv/bin/activate
python init_system.py 500
```

## 🧪 Tests

### Test de l'API Backend

```bash
# Status
curl http://localhost:8000/api/status

# Recherche
curl "http://localhost:8000/api/search?query=Matrix"

# Films populaires
curl "http://localhost:8000/api/popular?page=1"

# Détails d'un film
curl "http://localhost:8000/api/movie/603"

# Recommandations
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"liked_movies": [603, 27205, 157336], "top_k": 5}'

# Script de test complet
./test_api.sh
```

### Test Frontend

```bash
# Accéder à l'application
open http://localhost:5173

# Build de production
cd frontend
npm run build

# Preview du build
npm run preview
```

## 🔧 Maintenance

### Backend

```bash
# Mettre à jour les dépendances
cd backend
source .venv/bin/activate
pip install --upgrade -r requirements.txt

# Réinitialiser les données
rm -rf data/*
python init_system.py 500

# Vérifier la structure
python -c "from app.services.embedding_service import embedding_service; 
embedding_service.load_embeddings(); 
print(f'Loaded {len(embedding_service.movie_ids)} movies')"

# Lancer avec un port différent
python -m uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
# Mettre à jour les dépendances
cd frontend
npm update

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Build de production
npm run build

# Analyser la taille du bundle
npm run build -- --analyze
```

## 📊 Gestion des Données

### Sauvegarde

```bash
# Sauvegarder les embeddings
cd backend
tar -czf embeddings_backup_$(date +%Y%m%d).tar.gz data/

# Restaurer
tar -xzf embeddings_backup_YYYYMMDD.tar.gz
```

### Nettoyage

```bash
# Supprimer les données générées
cd backend
rm -rf data/*

# Supprimer les caches Python
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
```

## 🐳 Docker (Bonus)

### Build et Run

```bash
# Build les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Build et run en une commande
docker-compose up --build
```

### Initialiser dans Docker

```bash
# Exec dans le container backend
docker-compose exec backend python init_system.py 500
```

## 🔍 Debug & Logs

### Backend Logs

```bash
# Logs en temps réel (terminal où tourne uvicorn)
# Les logs apparaissent automatiquement

# Rediriger vers un fichier
python -m uvicorn app.main:app --reload 2>&1 | tee backend.log

# Niveau de log détaillé
python -m uvicorn app.main:app --reload --log-level debug
```

### Frontend Logs

```bash
# Navigateur: Console (Cmd+Option+J / F12)

# Build logs
npm run build 2>&1 | tee frontend.log
```

## 🌐 URLs Importantes

```bash
# Frontend
http://localhost:5173

# Backend API
http://localhost:8000

# Documentation Interactive (Swagger)
http://localhost:8000/docs

# Documentation Alternative (ReDoc)
http://localhost:8000/redoc

# OpenAPI Schema
http://localhost:8000/openapi.json

# Health Check
http://localhost:8000/health
```

## 📦 Variables d'Environnement

### Backend (.env)

```bash
# Voir le fichier
cat backend/.env

# Éditer
nano backend/.env
# ou
code backend/.env

# Variables essentielles:
# TMDB_API_KEY=votre_clé
# DATABASE_URL=sqlite+aiosqlite:///./data/movies.db
# FAISS_INDEX_PATH=./data/faiss_index.bin
```

### Frontend (.env)

```bash
# Voir
cat frontend/.env

# Variable:
# VITE_API_URL=http://localhost:8000/api
```

## 🔐 Sécurité

### Vérifier les clés API

```bash
# Backend
cd backend
grep "TMDB_API_KEY" .env

# Ne jamais commit les clés
git status
# .env doit être dans .gitignore
```

### Changer les ports

```bash
# Backend
python -m uvicorn app.main:app --reload --port 8080

# Frontend - éditer vite.config.js
# server: { port: 3000 }
```

## 📈 Performance

### Mesurer le temps de réponse

```bash
# Backend
time curl "http://localhost:8000/api/status"

# Recommandations avec temps
time curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"liked_movies": [603, 27205], "top_k": 10}'
```

### Analyser la taille

```bash
# Backend: taille des embeddings
ls -lh backend/data/

# Frontend: taille du bundle
cd frontend
npm run build
ls -lh dist/assets/
```

## 🔄 Git

### Initialiser le repo

```bash
git init
git add .
git commit -m "Initial commit: Movie recommendation system"
```

### Ignorer les fichiers sensibles

```bash
# Vérifier .gitignore
cat .gitignore

# Doit inclure:
# - .env
# - backend/data/
# - node_modules/
# - .venv/
```

## 🆘 Résolution de Problèmes

### "Module not found"

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

### "Port already in use"

```bash
# Trouver le processus
lsof -i :8000
lsof -i :5173

# Kill le processus
kill -9 <PID>
```

### "TMDB API error"

```bash
# Vérifier la clé
curl "https://api.themoviedb.org/3/movie/550?api_key=VOTRE_CLE"

# Doit retourner les détails de Fight Club
```

### "Embeddings not ready"

```bash
# Vérifier les fichiers
ls -la backend/data/

# Réinitialiser
cd backend
source .venv/bin/activate
python init_system.py 500
```

### Frontend ne charge pas

```bash
# Nettoyer et rebuild
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

## 📚 Aide

### Documentation

```bash
# Lire les READMEs
cat README.md
cat QUICKSTART.md
cat ARCHITECTURE.md

# Backend README
cat backend/README.md

# Frontend README
cat frontend/README.md
```

### Version des outils

```bash
# Python
python --version

# Node
node --version
npm --version

# Packages Python
pip list

# Packages Node
cd frontend
npm list --depth=0
```

## 🎓 Exemples d'Utilisation

### Recommandations par genre

```bash
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "liked_movies": [603, 155, 13],
    "top_k": 10,
    "filters": {
      "genre": "Science Fiction",
      "min_rating": 7.0
    }
  }'
```

### Recherche avec pagination

```bash
# Page 1
curl "http://localhost:8000/api/search?query=godfather&page=1"

# Page 2
curl "http://localhost:8000/api/search?query=godfather&page=2"
```

### Status détaillé

```bash
curl -s http://localhost:8000/api/status | python3 -m json.tool
```

---

**💡 Astuce**: Créez des alias pour les commandes fréquentes !

```bash
# Ajouter à ~/.zshrc ou ~/.bashrc
alias cinematch-backend="cd ~/FilmsReco/backend && source .venv/bin/activate && uvicorn app.main:app --reload"
alias cinematch-frontend="cd ~/FilmsReco/frontend && npm run dev"
alias cinematch-test="cd ~/FilmsReco && ./test_api.sh"
```
