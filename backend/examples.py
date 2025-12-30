"""
Exemples d'Utilisation Programmatique - CinéMatch Backend

Ce fichier montre comment utiliser les différents services du backend
directement dans du code Python (utile pour tests, scripts, notebooks).
"""

import asyncio
from app.services.tmdb_service import tmdb_service
from app.services.embedding_service import embedding_service
from app.services.faiss_service import faiss_service
from app.services.recommendation_service import recommendation_service


async def example_1_search_movies():
    """
    Exemple 1: Rechercher des films sur TMDB
    """
    print("=" * 60)
    print("EXEMPLE 1: Recherche de films")
    print("=" * 60)
    
    query = "Inception"
    results = await tmdb_service.search_movies(query, page=1)
    
    print(f"\nRecherche pour '{query}':")
    print(f"Total de résultats: {results['total_results']}")
    print(f"\nPremiers résultats:")
    
    for movie in results['results'][:5]:
        print(f"  - {movie['title']} ({movie.get('release_date', 'N/A')[:4]})")
        print(f"    Note: {movie.get('vote_average', 0)}/10")


async def example_2_get_movie_details():
    """
    Exemple 2: Obtenir les détails complets d'un film
    """
    print("\n" + "=" * 60)
    print("EXEMPLE 2: Détails d'un film")
    print("=" * 60)
    
    movie_id = 603  # The Matrix
    movie_data = await tmdb_service.get_complete_movie_data(movie_id)
    
    if movie_data:
        print(f"\nFilm: {movie_data['title']}")
        print(f"Genres: {', '.join(movie_data['genres'])}")
        print(f"Réalisateur: {movie_data.get('director', 'N/A')}")
        print(f"Cast: {', '.join(movie_data['cast'][:5])}")
        print(f"Mots-clés: {', '.join(movie_data['keywords'][:5])}")
        print(f"\nSynopsis:\n{movie_data['overview'][:200]}...")


async def example_3_generate_embedding():
    """
    Exemple 3: Générer un embedding pour un film
    """
    print("\n" + "=" * 60)
    print("EXEMPLE 3: Génération d'embedding")
    print("=" * 60)
    
    # Charger le modèle
    embedding_service.load_model()
    
    # Film fictif pour démonstration
    movie_data = {
        "title": "The Matrix",
        "genres": ["Science Fiction", "Action"],
        "overview": "A computer hacker learns about the true nature of reality...",
        "keywords": ["artificial intelligence", "dystopia", "virtual reality"],
        "cast": ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        "director": "The Wachowskis"
    }
    
    # Créer le texte d'embedding
    embedding_text = embedding_service.create_embedding_text(movie_data)
    print(f"\nTexte utilisé pour l'embedding:")
    print(embedding_text)
    
    # Générer l'embedding
    embedding = embedding_service.generate_embedding(embedding_text)
    
    print(f"\nEmbedding généré:")
    print(f"  Dimension: {embedding.shape}")
    print(f"  Type: {embedding.dtype}")
    print(f"  Norme L2: {(embedding ** 2).sum() ** 0.5:.4f}")  # Devrait être ~1.0
    print(f"  Premiers 10 valeurs: {embedding[:10]}")


async def example_4_similarity_search():
    """
    Exemple 4: Recherche de similarité avec FAISS
    """
    print("\n" + "=" * 60)
    print("EXEMPLE 4: Recherche de similarité")
    print("=" * 60)
    
    # Charger les embeddings et l'index
    if not embedding_service.load_embeddings():
        print("⚠️  Embeddings non trouvés. Exécutez d'abord l'initialisation.")
        return
    
    if not faiss_service.load_index():
        print("⚠️  Index FAISS non trouvé. Exécutez d'abord l'initialisation.")
        return
    
    # Choisir un film de référence
    reference_movie_id = 603  # The Matrix
    reference_idx = embedding_service.movie_ids.index(reference_movie_id)
    reference_embedding = embedding_service.embeddings[reference_idx]
    
    reference_metadata = embedding_service.get_movie_metadata(reference_movie_id)
    print(f"\nFilm de référence: {reference_metadata['title']}")
    
    # Rechercher les films similaires
    distances, indices = faiss_service.search(
        reference_embedding,
        k=6,  # Top 6 (incluant le film lui-même)
        exclude_indices=[reference_idx]  # Exclure le film de référence
    )
    
    print(f"\nTop 5 films similaires:")
    for i, (distance, idx) in enumerate(zip(distances[0], indices[0]), 1):
        movie_id = embedding_service.movie_ids[int(idx)]
        metadata = embedding_service.get_movie_metadata(movie_id)
        
        print(f"\n{i}. {metadata['title']} (Score: {distance:.3f})")
        print(f"   Genres: {', '.join(metadata['genres'][:3])}")
        print(f"   Note: {metadata.get('vote_average', 0)}/10")


async def example_5_user_recommendations():
    """
    Exemple 5: Générer des recommandations pour un profil utilisateur
    """
    print("\n" + "=" * 60)
    print("EXEMPLE 5: Recommandations utilisateur")
    print("=" * 60)
    
    # Films aimés par l'utilisateur
    # 603 = The Matrix
    # 13 = Forrest Gump
    # 155 = The Dark Knight
    liked_movies = [603, 13, 155]
    
    print("\nFilms aimés par l'utilisateur:")
    for movie_id in liked_movies:
        metadata = embedding_service.get_movie_metadata(movie_id)
        if metadata:
            print(f"  - {metadata['title']} ({', '.join(metadata['genres'][:2])})")
    
    # Générer le profil utilisateur
    user_profile = embedding_service.create_user_profile_embedding(liked_movies)
    
    if user_profile is not None:
        print(f"\nProfil utilisateur créé (dimension: {user_profile.shape})")
        
        # Obtenir les recommandations
        recommendations, _ = await recommendation_service.get_recommendations(
            liked_movie_ids=liked_movies,
            top_k=5
        )
        
        print(f"\nTop 5 recommandations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec.title} (Score: {rec.score:.3f})")
            print(f"   Genres: {', '.join(rec.genres[:3])}")
            print(f"   Note: {rec.vote_average}/10")
            if rec.overview:
                print(f"   Synopsis: {rec.overview[:150]}...")


async def example_6_batch_processing():
    """
    Exemple 6: Traitement par batch de plusieurs films
    """
    print("\n" + "=" * 60)
    print("EXEMPLE 6: Traitement par batch")
    print("=" * 60)
    
    # Liste de films à traiter
    movie_ids = [603, 155, 13, 27205, 157336]  # Matrix, Dark Knight, Forrest, Inception, Interstellar
    
    print(f"\nRécupération des détails de {len(movie_ids)} films...")
    
    # Récupérer les détails en parallèle avec asyncio.gather
    tasks = [tmdb_service.get_complete_movie_data(mid) for mid in movie_ids]
    movies_data = await asyncio.gather(*tasks)
    
    # Filtrer les résultats None
    valid_movies = [m for m in movies_data if m is not None]
    
    print(f"✅ {len(valid_movies)} films récupérés avec succès")
    
    # Générer les embeddings en batch
    embedding_service.load_model()
    embeddings, ids = embedding_service.batch_generate_embeddings(valid_movies)
    
    print(f"\nEmbeddings générés:")
    print(f"  Nombre: {len(embeddings)}")
    print(f"  Dimension: {embeddings.shape}")
    print(f"  Taille en mémoire: {embeddings.nbytes / 1024:.2f} KB")


async def example_7_filters():
    """
    Exemple 7: Recommandations avec filtres
    """
    print("\n" + "=" * 60)
    print("EXEMPLE 7: Recommandations avec filtres")
    print("=" * 60)
    
    liked_movies = [603, 155]  # The Matrix, The Dark Knight
    
    # Filtrer par genre et note minimum
    filters = {
        "genre": "Science Fiction",
        "min_rating": 7.0
    }
    
    print(f"\nFilms aimés: Matrix + Dark Knight")
    print(f"Filtres appliqués:")
    print(f"  - Genre: {filters['genre']}")
    print(f"  - Note minimum: {filters['min_rating']}")
    
    recommendations, _ = await recommendation_service.get_recommendations(
        liked_movie_ids=liked_movies,
        top_k=5,
        filters=filters
    )
    
    print(f"\nRecommandations filtrées:")
    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec.title}")
        print(f"   Genres: {', '.join(rec.genres)}")
        print(f"   Note: {rec.vote_average}/10")
        print(f"   Score de similarité: {rec.score:.3f}")


async def main():
    """
    Exécuter tous les exemples
    """
    print("\n" + "🎬" * 30)
    print("EXEMPLES D'UTILISATION - CinéMatch Backend")
    print("🎬" * 30 + "\n")
    
    try:
        # Exemple 1: Recherche simple
        await example_1_search_movies()
        
        # Exemple 2: Détails d'un film
        await example_2_get_movie_details()
        
        # Exemple 3: Génération d'embedding
        await example_3_generate_embedding()
        
        # Exemple 4: Recherche de similarité (nécessite initialisation)
        await example_4_similarity_search()
        
        # Exemple 5: Recommandations (nécessite initialisation)
        await example_5_user_recommendations()
        
        # Exemple 6: Batch processing
        await example_6_batch_processing()
        
        # Exemple 7: Filtres (nécessite initialisation)
        await example_7_filters()
        
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("\n💡 Assurez-vous que:")
        print("  1. Les variables d'environnement sont configurées (.env)")
        print("  2. Le système est initialisé (python init_system.py)")
    
    finally:
        # Nettoyer
        await tmdb_service.close()
    
    print("\n" + "=" * 60)
    print("Fin des exemples ✅")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    # Exécuter les exemples
    asyncio.run(main())
