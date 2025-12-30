"""
FAISS Service - Manages vector similarity search using FAISS
"""
import faiss
import numpy as np
from typing import List, Tuple, Optional
import logging
import os
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


class FAISSService:
    """Service for vector similarity search using FAISS"""
    
    def __init__(self):
        self.dimension = settings.EMBEDDING_DIMENSION
        self.index: Optional[faiss.Index] = None
        self.is_trained = False
    
    def create_index(self, embeddings: np.ndarray):
        """
        Create a new FAISS index from embeddings
        
        Args:
            embeddings: Array of embedding vectors (n_samples, dimension)
        """
        logger.info(f"Creating FAISS index with {len(embeddings)} vectors")
        
        # Use IndexFlatIP for inner product (cosine similarity with normalized vectors)
        # This is faster and works well with normalized embeddings
        self.index = faiss.IndexFlatIP(self.dimension)
        
        # Add vectors to index
        self.index.add(embeddings)
        self.is_trained = True
        
        logger.info(f"FAISS index created with {self.index.ntotal} vectors")
    
    def add_vectors(self, embeddings: np.ndarray):
        """
        Add new vectors to the existing index
        
        Args:
            embeddings: Array of embedding vectors to add
        """
        if self.index is None:
            # If no index exists, create one
            self.create_index(embeddings)
            return

        logger.info(f"Adding {len(embeddings)} vectors to FAISS index")
        
        # Add to index
        self.index.add(embeddings)
        
        logger.info(f"FAISS index updated, now contains {self.index.ntotal} vectors")

    def search(
        self,
        query_vector: np.ndarray,
        k: int = 10,
        exclude_indices: Optional[List[int]] = None
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Search for k nearest neighbors
        
        Args:
            query_vector: Query embedding vector (1D or 2D)
            k: Number of neighbors to return
            exclude_indices: Indices to exclude from results (e.g., input movies)
            
        Returns:
            Tuple of (distances, indices)
        """
        if self.index is None:
            raise ValueError("Index not created. Call create_index first.")
        
        # Ensure query vector is 2D
        if query_vector.ndim == 1:
            query_vector = query_vector.reshape(1, -1)
        
        # Search for more results if we need to exclude some
        search_k = k
        if exclude_indices:
            search_k = k + len(exclude_indices)
        
        # Perform search
        distances, indices = self.index.search(query_vector, search_k)
        
        # Exclude specified indices
        if exclude_indices:
            exclude_set = set(exclude_indices)
            mask = np.array([idx not in exclude_set for idx in indices[0]])
            distances = distances[0][mask][:k].reshape(1, -1)
            indices = indices[0][mask][:k].reshape(1, -1)
        
        return distances, indices
    
    def save_index(self):
        """Save FAISS index to disk"""
        if self.index is None:
            logger.warning("No index to save")
            return
        
        try:
            # Create directory if it doesn't exist
            index_path = Path(settings.FAISS_INDEX_PATH)
            index_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Save index
            faiss.write_index(self.index, str(index_path))
            logger.info(f"FAISS index saved to {index_path}")
            
        except Exception as e:
            logger.error(f"Error saving FAISS index: {e}")
    
    def load_index(self) -> bool:
        """
        Load FAISS index from disk
        
        Returns:
            True if successful, False otherwise
        """
        try:
            index_path = settings.FAISS_INDEX_PATH
            
            if not os.path.exists(index_path):
                logger.warning(f"Index file not found: {index_path}")
                return False
            
            # Load index
            self.index = faiss.read_index(index_path)
            self.is_trained = True
            
            logger.info(f"FAISS index loaded with {self.index.ntotal} vectors")
            return True
            
        except Exception as e:
            logger.error(f"Error loading FAISS index: {e}")
            return False
    
    def get_index_stats(self) -> dict:
        """Get statistics about the current index"""
        if self.index is None:
            return {
                "is_trained": False,
                "total_vectors": 0,
                "dimension": self.dimension
            }
        
        return {
            "is_trained": self.is_trained,
            "total_vectors": self.index.ntotal,
            "dimension": self.dimension
        }


# Global instance
faiss_service = FAISSService()
