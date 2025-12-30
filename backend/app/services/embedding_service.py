"""
Embedding Service - Generates and manages movie embeddings using SentenceTransformers
"""
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import logging
import json
import os
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating and managing movie embeddings"""
    
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self.dimension = settings.EMBEDDING_DIMENSION
        self.model: Optional[SentenceTransformer] = None
        self.embeddings: Optional[np.ndarray] = None
        self.movie_ids: List[int] = []
        self.movies_metadata: Dict[int, Dict[str, Any]] = {}
        
    def load_model(self):
        """Load the SentenceTransformer model"""
        if self.model is None:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded successfully")
    
    def create_embedding_text(self, movie_data: Dict[str, Any]) -> str:
        """
        Create a rich text representation of a movie for embedding
        
        Args:
            movie_data: Dictionary containing movie information
            
        Returns:
            Formatted text string for embedding
        """
        title = movie_data.get("title", "")
        genres = ", ".join(movie_data.get("genres", []))
        overview = movie_data.get("overview", "")
        keywords = ", ".join(movie_data.get("keywords", []))
        cast = ", ".join(movie_data.get("cast", []))
        director = movie_data.get("director", "")
        
        # Create rich text representation
        embedding_text = f"""
{title}
Genres: {genres}
Overview: {overview}
Keywords: {keywords}
Cast: {cast}
Director: {director}
        """.strip()
        
        return embedding_text
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding vector for text
        
        Args:
            text: Text to embed
            
        Returns:
            Normalized embedding vector
        """
        if self.model is None:
            self.load_model()
        
        # Generate embedding with normalization
        embedding = self.model.encode(
            text,
            normalize_embeddings=True,
            show_progress_bar=False
        )
        
        return embedding.astype('float32')
    
    def generate_movie_embedding(self, movie_data: Dict[str, Any]) -> np.ndarray:
        """
        Generate embedding for a complete movie
        
        Args:
            movie_data: Complete movie data
            
        Returns:
            Embedding vector
        """
        embedding_text = self.create_embedding_text(movie_data)
        return self.generate_embedding(embedding_text)
    
    def batch_generate_embeddings(
        self,
        movies_data: List[Dict[str, Any]]
    ) -> tuple[np.ndarray, List[int]]:
        """
        Generate embeddings for multiple movies efficiently
        
        Args:
            movies_data: List of movie data dictionaries
            
        Returns:
            Tuple of (embeddings array, movie IDs list)
        """
        if self.model is None:
            self.load_model()
        
        logger.info(f"Generating embeddings for {len(movies_data)} movies")
        
        # Create embedding texts
        embedding_texts = [
            self.create_embedding_text(movie)
            for movie in movies_data
        ]
        
        # Get movie IDs
        movie_ids = [movie["id"] for movie in movies_data]
        
        # Generate embeddings in batch
        embeddings = self.model.encode(
            embedding_texts,
            normalize_embeddings=True,
            show_progress_bar=True,
            batch_size=32
        )
        
        logger.info("Embeddings generated successfully")
        
        return embeddings.astype('float32'), movie_ids
    
    def create_user_profile_embedding(
        self,
        rated_movies: List[Any]
    ) -> Optional[np.ndarray]:
        """
        Create user profile embedding by calculating ratings-weighted average of movie embeddings
        
        Args:
            rated_movies: List of RatedMovie objects containing movie_id and rating
            
        Returns:
            User profile embedding vector or None if movies not found
        """
        if self.embeddings is None or len(self.movie_ids) == 0:
            logger.error("Embeddings not loaded")
            return None
        
        embeddings_list = []
        weights_list = []
        
        for item in rated_movies:
            movie_id = item.movie_id
            rating = item.rating
            
            try:
                idx = self.movie_ids.index(movie_id)
                embeddings_list.append(self.embeddings[idx])
                # Ensure rating is at least a small positive value if we want to include it, 
                # or treat 0 as "ignore". But user wants 0-10.
                # If rating is 0, it contributes 0 to the sum.
                weights_list.append(max(0.0, float(rating)))
            except ValueError:
                logger.warning(f"Movie ID {movie_id} not found in embeddings")
        
        if not embeddings_list:
            logger.error("None of the selected movies found in embeddings")
            return None
        
        # Convert to numpy arrays
        embeddings_matrix = np.vstack(embeddings_list)
        weights_array = np.array(weights_list).reshape(-1, 1)
        
        # Calculate weighted average
        total_weight = np.sum(weights_array)
        
        if total_weight > 0:
            weighted_sum = np.sum(embeddings_matrix * weights_array, axis=0)
            user_profile = weighted_sum / total_weight
        else:
            # Fallback to simple mean if total weight is 0
            user_profile = np.mean(embeddings_matrix, axis=0)
        
        # Re-normalize
        norm = np.linalg.norm(user_profile)
        if norm > 1e-9:
            user_profile = user_profile / norm
        else:
            user_profile = np.zeros_like(user_profile)
        
        return user_profile.astype('float32')
    
    def save_embeddings(self):
        """Save embeddings and metadata to disk"""
        try:
            # Create data directory if it doesn't exist
            data_dir = Path(settings.EMBEDDINGS_PATH).parent
            data_dir.mkdir(parents=True, exist_ok=True)
            
            # Save embeddings
            np.save(settings.EMBEDDINGS_PATH, self.embeddings)
            logger.info(f"Embeddings saved to {settings.EMBEDDINGS_PATH}")
            
            # Save movie IDs and metadata
            metadata = {
                "movie_ids": self.movie_ids,
                "movies_metadata": self.movies_metadata
            }
            
            with open(settings.MOVIES_METADATA_PATH, 'w') as f:
                json.dump(metadata, f)
            logger.info(f"Metadata saved to {settings.MOVIES_METADATA_PATH}")
            
        except Exception as e:
            logger.error(f"Error saving embeddings: {e}")
    
    def load_embeddings(self) -> bool:
        """
        Load embeddings and metadata from disk
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if files exist
            if not os.path.exists(settings.EMBEDDINGS_PATH):
                logger.warning("Embeddings file not found")
                return False
            
            if not os.path.exists(settings.MOVIES_METADATA_PATH):
                logger.warning("Metadata file not found")
                return False
            
            # Load embeddings
            self.embeddings = np.load(settings.EMBEDDINGS_PATH)
            logger.info(f"Loaded {len(self.embeddings)} embeddings")
            
            # Load metadata
            with open(settings.MOVIES_METADATA_PATH, 'r') as f:
                metadata = json.load(f)
                self.movie_ids = metadata["movie_ids"]
                self.movies_metadata = {
                    int(k): v for k, v in metadata["movies_metadata"].items()
                }
            
            logger.info("Embeddings and metadata loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading embeddings: {e}")
            return False
    
    def get_movie_metadata(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Get metadata for a specific movie"""
        return self.movies_metadata.get(movie_id)


    def add_single_movie_embedding(
        self,
        movie_id: int,
        embedding: np.ndarray,
        metadata: Dict[str, Any]
    ):
        """
        Add a single movie embedding to the in-memory store
        
        Args:
            movie_id: ID of the movie
            embedding: Embedding vector
            metadata: Movie metadata
        """
        if self.embeddings is None:
            self.embeddings = np.array([embedding])
        else:
            self.embeddings = np.vstack([self.embeddings, embedding])
            
        self.movie_ids.append(movie_id)
        self.movies_metadata[movie_id] = metadata
        
        logger.info(f"Added temporary embedding for movie ID {movie_id}")


# Global instance
embedding_service = EmbeddingService()
