#!/bin/bash

# 🎬 CinéMatch - Script de Test Rapide

echo "🎬 CinéMatch - Test de l'API Backend"
echo "===================================="
echo ""

API_URL="http://localhost:8000"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Test du statut
echo -e "${BLUE}[1/5]${NC} Test du statut de l'API..."
STATUS=$(curl -s ${API_URL}/api/status)
echo "$STATUS" | python3 -m json.tool
echo ""

# 2. Test de recherche
echo -e "${BLUE}[2/5]${NC} Recherche de films (query: 'Matrix')..."
curl -s "${API_URL}/api/search?query=Matrix&page=1" | python3 -m json.tool | head -n 50
echo ""

# 3. Test des films populaires
echo -e "${BLUE}[3/5]${NC} Récupération des films populaires..."
POPULAR=$(curl -s "${API_URL}/api/popular?page=1")
echo "$POPULAR" | python3 -m json.tool | head -n 50
echo ""

# 4. Test des détails d'un film (The Matrix - ID: 603)
echo -e "${BLUE}[4/5]${NC} Détails du film 'The Matrix' (ID: 603)..."
curl -s "${API_URL}/api/movie/603" | python3 -m json.tool
echo ""

# 5. Test de recommandations
echo -e "${BLUE}[5/5]${NC} Recommandations basées sur Matrix (603), Inception (27205), Interstellar (157336)..."
curl -s -X POST "${API_URL}/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "liked_movies": [603, 27205, 157336],
    "top_k": 5
  }' | python3 -m json.tool
echo ""

echo -e "${GREEN}✅ Tests terminés !${NC}"
echo ""
echo "Documentation complète : ${API_URL}/docs"
