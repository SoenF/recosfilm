"""
Script pour initialiser rapidement le système avec des films populaires
Usage: python init_system.py [nombre_de_films]
"""
import asyncio
import sys
from app.main import app
from app.services.recommendation_service import recommendation_service


async def main():
    num_movies = 500
    
    if len(sys.argv) > 1:
        try:
            num_movies = int(sys.argv[1])
            if num_movies < 100 or num_movies > 5000:
                print("⚠️  Le nombre de films doit être entre 100 et 5000")
                num_movies = 500
        except ValueError:
            print("⚠️  Argument invalide, utilisation de la valeur par défaut (500)")
    
    print(f"🎬 Initialisation du système avec {num_movies} films...")
    print("⏱️  Cette opération peut prendre 10-15 minutes...")
    print("")
    
    try:
        await recommendation_service.initialize_from_popular_movies(num_movies=num_movies)
        print("")
        print("✅ Système initialisé avec succès !")
        print(f"📊 {num_movies} films indexés et prêts pour les recommandations")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation : {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
