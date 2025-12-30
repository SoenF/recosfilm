"""
FastAPI main application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.routes import router
from app.services.embedding_service import embedding_service
from app.services.faiss_service import faiss_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events
    """
    # Startup
    logger.info("Starting Movie Recommendation API")
    
    # Load embedding model
    logger.info("Loading embedding model...")
    embedding_service.load_model()
    
    # Try to load existing embeddings and index
    logger.info("Loading embeddings and FAISS index...")
    embeddings_loaded = embedding_service.load_embeddings()
    index_loaded = faiss_service.load_index()
    
    if embeddings_loaded and index_loaded:
        logger.info("✅ System ready with pre-computed embeddings")
    else:
        logger.warning("⚠️  No pre-computed embeddings found. Run /initialize endpoint to set up the system.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Movie Recommendation API")


# Create FastAPI app
app = FastAPI(
    title="Movie Recommendation API",
    description="""
    🎬 Modern Movie Recommendation System using Semantic Embeddings
    
    This API provides personalized movie recommendations based on semantic similarity
    using state-of-the-art sentence transformers and FAISS vector search.
    
    ## Features
    
    * 🔍 **Search Movies**: Search for movies by title using TMDB
    * 🎯 **Get Recommendations**: Get personalized recommendations based on liked movies
    * 📊 **Movie Details**: Get detailed information about any movie
    * 🌟 **Popular Movies**: Browse popular movies for cold start
    * ⚙️ **System Initialization**: Initialize the system with popular movies
    
    ## How it works
    
    1. Select movies you like
    2. System creates semantic embeddings from movie metadata (title, genres, overview, keywords, cast, director)
    3. User profile is created by averaging embeddings of liked movies
    4. FAISS performs fast similarity search to find similar movies
    5. Results are ranked by semantic similarity score
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api", tags=["recommendations"])


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Movie Recommendation API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "embeddings_loaded": embedding_service.embeddings is not None,
        "faiss_ready": faiss_service.index is not None
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
