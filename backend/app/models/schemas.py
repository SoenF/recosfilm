"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class MovieBase(BaseModel):
    """Base movie information"""
    id: int
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    genres: List[str] = []
    runtime: Optional[int] = None


class MovieDetail(MovieBase):
    """Detailed movie information with metadata for embeddings"""
    keywords: List[str] = []
    cast: List[str] = []
    director: Optional[str] = None
    runtime: Optional[int] = None
    popularity: Optional[float] = None


class MovieEmbedding(BaseModel):
    """Movie with its embedding representation"""
    movie_id: int
    embedding_text: str
    embedding_vector: List[float]


class RatedMovie(BaseModel):
    """A movie rated by the user"""
    movie_id: int
    rating: float = Field(
        default=5.0,
        ge=0.0,
        le=10.0,
        description="User rating from 0 to 10"
    )


class RecommendationRequest(BaseModel):
    """Request for movie recommendations"""
    liked_movies: List[RatedMovie] = Field(
        ...,
        description="List of movies with ratings that the user likes",
        min_length=1
    )
    top_k: int = Field(
        default=10,
        description="Number of recommendations to return",
        ge=1,
        le=50
    )
    filters: Optional[dict] = Field(
        default=None,
        description="Optional filters for genre, year, etc."
    )


class RecommendationItem(BaseModel):
    """A single recommendation result"""
    movie_id: int
    title: str
    score: float = Field(
        ...,
        description="Similarity score (0-1)",
        ge=0.0,
        le=1.0
    )
    poster_url: Optional[str] = None
    overview: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    genres: List[str] = []
    runtime: Optional[int] = None


class RecommendationResponse(BaseModel):
    """Response containing recommended movies"""
    recommendations: List[RecommendationItem]
    user_profile_movies: List[MovieBase] = Field(
        description="Movies used to build the user profile"
    )


class SearchRequest(BaseModel):
    """Request to search for movies"""
    query: str = Field(..., min_length=1, max_length=200)
    page: int = Field(default=1, ge=1)


class SearchResponse(BaseModel):
    """Response containing search results"""
    results: List[MovieBase]
    page: int
    total_pages: int
    total_results: int


class StatusResponse(BaseModel):
    """API status information"""
    status: str
    total_movies: int
    embeddings_ready: bool
    faiss_index_ready: bool
