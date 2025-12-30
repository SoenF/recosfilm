# 🚀 Guide de Démarrage Rapide - CinéMatch

Guide pas-à-pas pour démarrer l'application en moins de 5 minutes.

## ⚡ Quick Start

### 1. Obtenir une clé API TMDB (2 minutes)

1. Allez sur [themoviedb.org](https://www.themoviedb.org/signup)
2. Créez un compte gratuit
3. Allez dans **Paramètres** → **API**
4. Demandez une clé API (instantané)
5. Copiez votre **API Key** (v3 auth)

### 2. Configuration Backend (2 minutes)

```bash
# Terminal 1 - Backend
cd backend

# Créer l'environnement virtuel
python3 -m venv .venv
source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Ajouter votre clé API TMDB
echo "TMDB_API_KEY=VOTRE_CLE_ICI" >> .env
cat .env.example >> .env
```

### 3. Démarrer le Backend (30 secondes)

```bash
# Toujours dans backend/
python -m uvicorn app.main:app --reload
```

Vous devriez voir :
```
INFO:     Uvicorn running on http://localhost:8000
INFO:     Loading embedding model: all-MiniLM-L6-v2
```

### 4. Initialiser la Base de Données (10-15 minutes)

**Dans un nouveau terminal** :

```bash
curl -X POST "http://localhost:8000/api/initialize?num_movies=500"
```

⏳ Cette étape prend du temps car elle :
- Télécharge 500 films depuis TMDB
- Génère les embeddings sémantiques
- Construit l'index FAISS

☕ Allez prendre un café pendant ce temps !

### 5. Démarrer le Frontend (30 secondes)

**Dans un nouveau terminal** :

```bash
# Terminal 2 - Frontend
cd frontend

# Démarrer le serveur de dev
npm run dev
```

### 6. Ouvrir l'Application

Ouvrez votre navigateur sur :

👉 **[http://localhost:5173](http://localhost:5173)**

## ✅ Vérification

### Backend OK ?

```bash
curl http://localhost:8000/api/status
```

Réponse attendue :
```json
{
  "status": "healthy",
  "total_movies": 500,
  "embeddings_ready": true,
  "faiss_index_ready": true
}
```

### Frontend OK ?

Ouvrez [http://localhost:5173](http://localhost:5173)
- Vous devriez voir le header "CinéMatch"
- Un badge vert "500 films indexés"
- Des films populaires affichés

## 🎬 Première Utilisation

1. **Recherchez un film** : Tapez "Inception" dans la barre de recherche
2. **Sélectionnez 3-5 films** que vous aimez (cliquez dessus)
3. **Cliquez** sur le bouton "Obtenir des recommandations"
4. **Admirez** vos recommandations avec leurs scores de similarité !

## 🔧 Commandes Utiles

### Redémarrer le Backend
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

### Redémarrer le Frontend
```bash
cd frontend
npm run dev
```

### Voir les logs du Backend
Les logs s'affichent directement dans le terminal où le backend tourne.

### Arrêter tout
- `Ctrl + C` dans chaque terminal

## 🐛 Problèmes Communs

### "Module not found" (Backend)
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

### "Cannot GET /api/..." (Frontend)
→ Le backend n'est pas démarré. Relancez-le.

### "Embeddings not ready"
→ L'initialisation n'est pas terminée. Attendez ou relancez :
```bash
curl -X POST "http://localhost:8000/api/initialize?num_movies=500"
```

### CORS Error
→ Vérifiez que le frontend tourne sur port 5173 et le backend sur 8000.

## 📂 Structure des Fichiers

```
FilmsReco/
├── backend/
│   ├── .venv/              # Environnement virtuel Python
│   ├── app/                # Code de l'application
│   ├── data/               # Données générées (après init)
│   ├── .env                # Variables d'environnement
│   └── requirements.txt    # Dépendances Python
│
└── frontend/
    ├── node_modules/       # Dépendances Node
    ├── src/                # Code React
    ├── .env                # Config frontend
    └── package.json        # Dépendances Node
```

## 🎓 Prochaines Étapes

1. **Explorez l'API** : [http://localhost:8000/docs](http://localhost:8000/docs)
2. **Testez différents films** : Action, comédie, drame...
3. **Regardez les scores** : Plus le score est élevé, plus la similarité est forte
4. **Filtrez** : Utilisez les filtres de genre (à venir)

## 📚 Documentation Complète

Pour plus de détails :
- **README principal** : `README.md`
- **Backend** : `backend/README.md`
- **Frontend** : `frontend/README.md`

## 💡 Conseils

- **Sélectionnez 3-5 films** pour de meilleures recommandations
- **Variez les genres** pour des suggestions plus diversifiées
- **Utilisez la recherche** pour trouver des films spécifiques
- **Le score de similarité** va de 0 à 1 (1 = identique)

## 🆘 Besoin d'Aide ?

1. Vérifiez les logs dans les terminaux
2. Consultez la section Troubleshooting du README principal
3. Vérifiez que tous les services tournent (backend + frontend)
4. Assurez-vous que votre clé TMDB est valide

---

**Bon développement ! 🚀**
