"""
Recommendation Service - Orchestrates the recommendation pipeline
"""
import numpy as np
from typing import List, Dict, Any, Optional
import logging

from app.services.embedding_service import embedding_service
from app.services.faiss_service import faiss_service
from app.services.tmdb_service import tmdb_service
from app.models.schemas import RecommendationItem, MovieBase

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service for generating movie recommendations"""
    
    async def get_recommendations(
        self,
        liked_movies: List[Any],
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> tuple[List[RecommendationItem], List[MovieBase]]:
        """
        Generate movie recommendations based on liked movies
        
        Args:
            liked_movies: List of RatedMovie objects (movies the user likes with their ratings)
            top_k: Number of recommendations to return
            filters: Optional filters (genre, year, etc.)
            
        Returns:
            Tuple of (recommendations, user_profile_movies)
        """
        logger.info(f"Generating recommendations for {len(liked_movies)} liked movies")
        
        # Check for missing embeddings and generate them on fly
        for item in liked_movies:
            movie_id = item.movie_id
            if movie_id not in embedding_service.movie_ids:
                logger.info(f"Movie ID {movie_id} not in embeddings, fetching and generating...")
                try:
                    # Fetch complete data
                    movie_data = await tmdb_service.get_complete_movie_data(movie_id)
                    if movie_data:
                        # Generate embedding
                        embedding = embedding_service.generate_movie_embedding(movie_data)
                        
                        # Add to embedding service (memory)
                        embedding_service.add_single_movie_embedding(movie_id, embedding, movie_data)
                        
                        # Add to FAISS index (memory) and save index
                        # Provide embedding as 2D array for FAISS
                        faiss_service.add_vectors(embedding.reshape(1, -1))
                        
                        # Persist everything to disk
                        embedding_service.save_embeddings()
                        faiss_service.save_index()
                        
                        logger.info(f"Permanently added movie {movie_id} to database")
                except Exception as e:
                    logger.error(f"Failed to generate on-fly embedding for {movie_id}: {e}")

        # Create user profile embedding
        user_profile = embedding_service.create_user_profile_embedding(liked_movies)
        
        if user_profile is None:
            logger.error("Failed to create user profile")
            return [], []
        
        # Find indices of liked movies to exclude them from results
        liked_indices = []
        for item in liked_movies:
            movie_id = item.movie_id
            try:
                idx = embedding_service.movie_ids.index(movie_id)
                liked_indices.append(idx)
            except ValueError:
                pass
        
        # Search for similar movies
        distances, indices = faiss_service.search(
            user_profile,
            k=top_k * 2,  # Get more to allow for filtering
            exclude_indices=liked_indices
        )
        
        # Convert to recommendations
        recommendations = []
        for distance, idx in zip(distances[0], indices[0]):
            movie_id = embedding_service.movie_ids[int(idx)]
            metadata = embedding_service.get_movie_metadata(movie_id)
            
            if metadata is None:
                continue
            
            # Apply filters if provided
            if filters:
                if not self._apply_filters(metadata, filters):
                    continue
            
            recommendation = RecommendationItem(
                movie_id=movie_id,
                title=metadata.get("title", ""),
                score=float(distance),  # Distance is already cosine similarity
                poster_url=metadata.get("poster_path"),
                overview=metadata.get("overview"),
                release_date=metadata.get("release_date"),
                vote_average=metadata.get("vote_average"),
                genres=metadata.get("genres", []),
                runtime=metadata.get("runtime")
            )
            
            recommendations.append(recommendation)
            
            if len(recommendations) >= top_k:
                break
        

        # Get user profile movies info
        user_profile_movies = []
        for item in liked_movies:
            movie_id = item.movie_id
            metadata = embedding_service.get_movie_metadata(movie_id)
            if metadata:
                user_profile_movies.append(MovieBase(
                    id=movie_id,
                    title=metadata.get("title", ""),
                    overview=metadata.get("overview"),
                    poster_path=metadata.get("poster_path"),
                    release_date=metadata.get("release_date"),
                    vote_average=metadata.get("vote_average"),
                    genres=metadata.get("genres", []),
                    runtime=metadata.get("runtime")
                ))
        
        logger.info(f"Generated {len(recommendations)} recommendations")
        
        return recommendations, user_profile_movies
    

    
    def _apply_filters(self, metadata: Dict[str, Any], filters: Dict[str, Any]) -> bool:
        """
        Apply filters to a movie
        
        Args:
            metadata: Movie metadata
            filters: Filter criteria
            
        Returns:
            True if movie passes filters
        """
        if not filters:
            return True

        # Genre filter
        if "genre" in filters and filters["genre"]:
            required_genre = filters["genre"]
            if required_genre not in metadata.get("genres", []):
                return False
        
        # Year filter (min_year)
        if "year" in filters and filters["year"]:
            # Handle year can be string or int
            try:
                min_year = int(filters["year"])
                release_date = metadata.get("release_date", "")
                if not release_date:
                    return False
                movie_year = int(release_date.split("-")[0])
                if movie_year < min_year:
                    return False
            except (ValueError, IndexError):
                pass
        
        # Minimum rating filter
        if "min_rating" in filters and filters["min_rating"]:
            min_rating = float(filters["min_rating"])
            if metadata.get("vote_average", 0) < min_rating:
                return False

        # Actor filter (partial match, case-insensitive)
        if "actor" in filters and filters["actor"]:
            target_actor = filters["actor"].lower()
            cast_list = [c.lower() for c in metadata.get("cast", [])]
            # Check if any cast member contains the target string
            if not any(target_actor in actor for actor in cast_list):
                 return False

        # Runtime filter
        current_runtime = metadata.get("runtime") or 0
        if "min_runtime" in filters and filters["min_runtime"]:
            if current_runtime < int(filters["min_runtime"]):
                return False
        
        if "max_runtime" in filters and filters["max_runtime"]:
            if current_runtime > int(filters["max_runtime"]):
                return False
        
        return True
    
    async def initialize_from_popular_movies(self, num_movies: int = 500):
        """
        Initialize the system by fetching popular movies and generating embeddings
        
        Args:
            num_movies: Number of popular movies to fetch
        """
        logger.info(f"Initializing system with {num_movies} movies (50% popular, 50% top rated)")
        
        all_movies_data = []
        seen_ids = set()
        
        # Target counts
        target_per_category = num_movies // 2
        
        # 1. Fetch Popular Movies
        logger.info("Fetching popular movies...")
        page = 1
        count_popular = 0
        while count_popular < target_per_category and page <= 500:
            movies_batch = await tmdb_service.get_popular_movies(page=page)
            if not movies_batch:
                break
                
            for movie_basic in movies_batch:
                movie_id = movie_basic["id"]
                if movie_id in seen_ids:
                    continue
                    
                complete_data = await tmdb_service.get_complete_movie_data(movie_id)
                if complete_data:
                    all_movies_data.append(complete_data)
                    seen_ids.add(movie_id)
                    count_popular += 1
                    
                if count_popular >= target_per_category:
                    break
            
            page += 1
            
        # 2. Fetch Top Rated Movies
        logger.info("Fetching top rated movies...")
        page = 1
        # Continue filling until we reach total num_movies
        while len(all_movies_data) < num_movies and page <= 500:
            movies_batch = await tmdb_service.get_top_rated_movies(page=page)
            if not movies_batch:
                break
                
            for movie_basic in movies_batch:
                movie_id = movie_basic["id"]
                if movie_id in seen_ids:
                    continue
                    
                complete_data = await tmdb_service.get_complete_movie_data(movie_id)
                if complete_data:
                    all_movies_data.append(complete_data)
                    seen_ids.add(movie_id)
                    
                if len(all_movies_data) >= num_movies:
                    break
            
            page += 1
        
        logger.info(f"Fetched {len(all_movies_data)} movies")
        
        # Generate embeddings
        embeddings, movie_ids = embedding_service.batch_generate_embeddings(all_movies_data)
        
        # Store in embedding service
        embedding_service.embeddings = embeddings
        embedding_service.movie_ids = movie_ids
        embedding_service.movies_metadata = {
            movie["id"]: movie for movie in all_movies_data
        }
        
        # Create FAISS index
        faiss_service.create_index(embeddings)
        
        # Save to disk
        embedding_service.save_embeddings()
        faiss_service.save_index()
        
        logger.info("System initialized successfully")


# Global instance
recommendation_service = RecommendationService()
