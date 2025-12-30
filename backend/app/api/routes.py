"""
API Routes for the movie recommendation system
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from app.models.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    SearchRequest,
    SearchResponse,
    StatusResponse,
    MovieBase,
    MovieDetail
)
from app.services.recommendation_service import recommendation_service
from app.services.tmdb_service import tmdb_service
from app.services.embedding_service import embedding_service
from app.services.faiss_service import faiss_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get movie recommendations based on liked movies
    
    - **liked_movies**: List of TMDB movie IDs that the user likes
    - **top_k**: Number of recommendations to return (default: 10, max: 50)
    - **filters**: Optional filters for genre, year, minimum rating
    """
    try:
        recommendations, user_profile_movies = await recommendation_service.get_recommendations(
            liked_movies=request.liked_movies,
            top_k=request.top_k,
            filters=request.filters
        )
        
        return RecommendationResponse(
            recommendations=recommendations,
            user_profile_movies=user_profile_movies
        )
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=SearchResponse)
async def search_movies(
    query: str = Query(..., min_length=1, max_length=200),
    page: int = Query(1, ge=1)
):
    """
    Search for movies by title
    
    - **query**: Search query string
    - **page**: Page number for pagination
    """
    try:
        results = await tmdb_service.search_movies(query=query, page=page)
        
        return SearchResponse(
            results=[MovieBase(**movie) for movie in results["results"]],
            page=results["page"],
            total_pages=results["total_pages"],
            total_results=results["total_results"]
        )
        
    except Exception as e:
        logger.error(f"Error searching movies: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/search/person")
async def search_person(
    query: str = Query(..., min_length=1, max_length=100)
):
    """
    Search for people (actors, directors)
    """
    try:
        results = await tmdb_service.search_person(query=query)
        return results
    except Exception as e:
        logger.error(f"Error searching person: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/movie/{movie_id}", response_model=MovieDetail)
async def get_movie_details(movie_id: int):
    """
    Get detailed information about a specific movie
    
    - **movie_id**: TMDB movie ID
    """
    try:
        # Try to get from cache first
        cached_metadata = embedding_service.get_movie_metadata(movie_id)
        
        if cached_metadata:
            return MovieDetail(**cached_metadata)
        
        # Otherwise fetch from TMDB
        movie_data = await tmdb_service.get_complete_movie_data(movie_id)
        
        if not movie_data:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        return MovieDetail(**movie_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching movie details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/popular", response_model=SearchResponse)
async def get_popular_movies(page: int = Query(1, ge=1, le=500)):
    """
    Get popular movies for cold start
    
    - **page**: Page number (1-500)
    """
    try:
        popular_movies = await tmdb_service.get_popular_movies(page=page)
        
        return SearchResponse(
            results=[MovieBase(**movie) for movie in popular_movies],
            page=page,
            total_pages=500,  # TMDB limit
            total_results=10000  # TMDB limit
        )
        
    except Exception as e:
        logger.error(f"Error fetching popular movies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=StatusResponse)
async def get_status():
    """
    Get API status and system information
    """
    try:
        index_stats = faiss_service.get_index_stats()
        
        return StatusResponse(
            status="healthy",
            total_movies=len(embedding_service.movie_ids),
            embeddings_ready=embedding_service.embeddings is not None,
            faiss_index_ready=index_stats["is_trained"]
        )
        
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        return StatusResponse(
            status="error",
            total_movies=0,
            embeddings_ready=False,
            faiss_index_ready=False
        )


@router.post("/initialize")
async def initialize_system(num_movies: int = Query(500, ge=100, le=10000)):
    """
    Initialize the system by fetching popular movies and generating embeddings
    
    ⚠️ This is a long-running operation that should only be run once during setup
    
    - **num_movies**: Number of popular movies to fetch and process (100-1000)
    """
    try:
        await recommendation_service.initialize_from_popular_movies(num_movies=num_movies)
        
        return {
            "status": "success",
            "message": f"System initialized with {num_movies} movies",
            "total_movies": len(embedding_service.movie_ids)
        }
        
    except Exception as e:
        logger.error(f"Error initializing system: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/genres")
async def get_genres():
    """Get list of movie genres"""
    try:
        return await tmdb_service.get_genres()
    except Exception as e:
        logger.error(f"Error fetching genres: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/discover")
async def discover_movies(
    sort_by: str = Query("vote_average.desc"),
    genre_id: Optional[str] = Query(None),
    min_vote_count: int = Query(500),
    page: int = Query(1)
):
    """
    Discover movies (Top Rated, etc.)
    """
    try:
        return await tmdb_service.discover_movies(
            sort_by=sort_by,
            genre_id=genre_id,
            min_vote_count=min_vote_count,
            page=page
        )
    except Exception as e:
        logger.error(f"Error discovering movies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/person/{person_id}/movies")
async def get_person_movies(person_id: int):
    """
    Get all movies for a specific person, ranked by rating
    """
    try:
        return await tmdb_service.get_person_movie_credits(person_id)
    except Exception as e:
        logger.error(f"Error fetching person movies: {e}")
        raise HTTPException(status_code=500, detail=str(e))
