"""
TMDB API Service - Handles all interactions with The Movie Database API
"""
import httpx
from typing import List, Optional, Dict, Any
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class TMDBService:
    """Service for interacting with TMDB API"""
    
    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.base_url = settings.TMDB_BASE_URL
        self.image_base_url = settings.TMDB_IMAGE_BASE_URL
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get common headers for TMDB API requests"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def _get_poster_url(self, poster_path: Optional[str]) -> Optional[str]:
        # Convert poster path to full URL
        if not poster_path:
            return None
        return f"{self.image_base_url}{poster_path}"

    async def _populate_movie_data(self, movies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Helper to fetch additional details (runtime, genres) for a list of movies concurrently"""
        import asyncio
        async def populate_one(m):
            details = await self.get_movie_details(m['id'])
            if details:
                m['runtime'] = details.get('runtime')
                
                # Use refined genres if available
                genres = details.get('genres', [])
                keywords = details.get('keywords', [])
                m['genres'] = self._refine_genres(genres, keywords)
            return m
        return await asyncio.gather(*[populate_one(m) for m in movies])

    def _refine_genres(self, genres: List[str], keywords: List[str]) -> List[str]:
        """Refine genre names for more precision (e.g., 'Comédie Romantique')"""
        if not genres:
            return []
            
        refined = []
        keywords_lower = [k.lower() for k in keywords]
        
        has_comedy = "Comédie" in genres
        has_romance = "Romance" in genres
        has_drama = "Drame" in genres
        has_horror = "Horreur" in genres
        has_music = "Musique" in genres
        has_action = "Action" in genres
        
        for g in genres:
            if g == "Comédie":
                # Check for Dramedy (Prioritize Drama over Romance for tone)
                if has_drama:
                    refined.append("Comédie Dramatique")
                # Check for RomCom
                elif has_romance or "romantic comedy" in keywords_lower or "romcom" in keywords_lower:
                    if "Comédie Romantique" not in refined:
                        refined.append("Comédie Romantique")
                # Check for Dark Comedy
                elif "dark comedy" in keywords_lower or "black comedy" in keywords_lower:
                    refined.append("Comédie Noire")
                # Check for Horror Comedy
                elif has_horror or "horror comedy" in keywords_lower:
                    refined.append("Comédie Horrifique")
                # Check for Action Comedy
                elif has_action:
                    refined.append("Action-Comédie")
                # Check for Parody
                elif "parody" in keywords_lower or "spoof" in keywords_lower:
                    refined.append("Parodie")
                # Check for Musical Comedy
                elif has_music:
                    refined.append("Comédie Musicale")
                else:
                    refined.append("Comédie")
            elif g == "Romance" and ("Comédie Romantique" in refined):
                continue
            elif g == "Drame" and ("Comédie Dramatique" in refined):
                continue
            elif g == "Horreur" and ("Comédie Horrifique" in refined):
                continue
            elif g == "Action" and ("Action-Comédie" in refined):
                continue
            else:
                if g not in refined:
                    refined.append(g)
                    
        return refined
    
    async def search_movies(self, query: str, page: int = 1) -> Dict[str, Any]:
        """
        Search for movies by title
        
        Args:
            query: Search query string
            page: Page number for pagination
            
        Returns:
            Dictionary with search results
        """
        try:
            url = f"{self.base_url}/search/movie"
            params = {
                "query": query,
                "page": page,
                "language": "fr-FR",
                "include_adult": False
            }
            headers = self._get_headers()
            
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Format results
            formatted_results = []
            for movie in data.get("results", []):
                formatted_results.append({
                    "id": movie.get("id"),
                    "title": movie.get("title"),
                    "overview": movie.get("overview"),
                    "poster_path": self._get_poster_url(movie.get("poster_path")),
                    "release_date": movie.get("release_date"),
                    "vote_average": movie.get("vote_average"),
                    "genres": []
                })
            
            # Populate data (runtime, genres)
            formatted_results = await self._populate_movie_data(formatted_results)
            
            return {
                "results": formatted_results,
                "page": data.get("page", 1),
                "total_pages": data.get("total_pages", 0),
                "total_results": data.get("total_results", 0)
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Error searching movies: {e}")
            return {
                "results": [],
                "page": 1,
                "total_pages": 0,
                "total_results": 0
            }
    
    async def get_movie_details(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific movie
        
        Args:
            movie_id: TMDB movie ID
            
        Returns:
            Dictionary with movie details or None if not found
        """
        try:
            url = f"{self.base_url}/movie/{movie_id}"
            params = {
                "language": "fr-FR",
                "append_to_response": "keywords"
            }
            headers = self._get_headers()
            
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            movie = response.json()
            
            genres = [g.get("name") for g in movie.get("genres", [])]
            keywords_data = movie.get("keywords", {}).get("keywords", [])
            keywords = [kw.get("name") for kw in keywords_data]
            
            return {
                "id": movie.get("id"),
                "title": movie.get("title"),
                "overview": movie.get("overview"),
                "poster_path": self._get_poster_url(movie.get("poster_path")),
                "release_date": movie.get("release_date"),
                "vote_average": movie.get("vote_average"),
                "genres": genres,
                "keywords": keywords,
                "runtime": movie.get("runtime"),
                "popularity": movie.get("popularity")
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Error fetching movie {movie_id}: {e}")
            return None
    
    async def get_movie_keywords(self, movie_id: int) -> List[str]:
        """
        Get keywords for a movie
        
        Args:
            movie_id: TMDB movie ID
            
        Returns:
            List of keyword strings
        """
        try:
            url = f"{self.base_url}/movie/{movie_id}/keywords"
            headers = self._get_headers()
            
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            return [kw.get("name") for kw in data.get("keywords", [])]
            
        except httpx.HTTPError as e:
            logger.error(f"Error fetching keywords for movie {movie_id}: {e}")
            return []
    
    async def get_movie_credits(self, movie_id: int) -> Dict[str, Any]:
        """
        Get cast and crew information for a movie
        
        Args:
            movie_id: TMDB movie ID
            
        Returns:
            Dictionary with cast and director information
        """
        try:
            url = f"{self.base_url}/movie/{movie_id}/credits"
            headers = self._get_headers()
            
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Get top 5 cast members
            cast = [
                member.get("name")
                for member in data.get("cast", [])[:5]
            ]
            
            # Find director
            director = None
            for crew_member in data.get("crew", []):
                if crew_member.get("job") == "Director":
                    director = crew_member.get("name")
                    break
            
            return {
                "cast": cast,
                "director": director
            }
            
        except httpx.HTTPError as e:
            logger.error(f"Error fetching credits for movie {movie_id}: {e}")
            return {"cast": [], "director": None}
    
    async def get_popular_movies(self, page: int = 1) -> List[Dict[str, Any]]:
        """
        Get popular movies for cold start
        
        Args:
            page: Page number
            
        Returns:
            List of popular movies
        """
        try:
            url = f"{self.base_url}/movie/popular"
            params = {
                "page": page,
                "language": "fr-FR"
            }
            headers = self._get_headers()
            
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            formatted_results = []
            for movie in data.get("results", []):
                formatted_results.append({
                    "id": movie.get("id"),
                    "title": movie.get("title"),
                    "overview": movie.get("overview"),
                    "poster_path": self._get_poster_url(movie.get("poster_path")),
                    "release_date": movie.get("release_date"),
                    "vote_average": movie.get("vote_average"),
                    "genres": []
                })
            
            return await self._populate_movie_data(formatted_results)
            
        except httpx.HTTPError as e:
            logger.error(f"Error fetching popular movies: {e}")
            return []

    async def get_top_rated_movies(self, page: int = 1) -> List[Dict[str, Any]]:
        """
        Get top rated movies for broader catalog
        
        Args:
            page: Page number
            
        Returns:
            List of top rated movies
        """
        try:
            url = f"{self.base_url}/movie/top_rated"
            params = {
                "page": page,
                "language": "fr-FR"
            }
            headers = self._get_headers()
            
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            formatted_results = []
            for movie in data.get("results", []):
                formatted_results.append({
                    "id": movie.get("id"),
                    "title": movie.get("title"),
                    "overview": movie.get("overview"),
                    "poster_path": self._get_poster_url(movie.get("poster_path")),
                    "release_date": movie.get("release_date"),
                    "vote_average": movie.get("vote_average"),
                    "genres": []
                })
            
            return await self._populate_movie_data(formatted_results)
            
        except httpx.HTTPError as e:
            logger.error(f"Error fetching top rated movies: {e}")
            return []
    
    async def get_complete_movie_data(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """
        Get complete movie data including details, keywords, and credits
        This is used for generating embeddings
        
        Args:
            movie_id: TMDB movie ID
            
        Returns:
            Complete movie data dictionary
        """
        # Fetch all data concurrently
        details = await self.get_movie_details(movie_id)
        if not details:
            return None
        
        keywords = await self.get_movie_keywords(movie_id)
        credits = await self.get_movie_credits(movie_id)
        
        # Combine all data
        complete_data = {
            **details,
            "keywords": keywords,
            **credits
        }
        
        return complete_data

    async def search_person(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for people (actors, directors, etc.)
        
        Args:
            query: Search query string
            
        Returns:
            List of person dictionaries
        """
        try:
            url = f"{self.base_url}/search/person"
            params = {
                "query": query,
                "language": "fr-FR",
                "page": 1,
                "include_adult": False
            }
            headers = self._get_headers()
            
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Format results
            people = []
            for person in data.get("results", []):
                people.append({
                    "id": person.get("id"),
                    "name": person.get("name"),
                    "profile_path": self._get_poster_url(person.get("profile_path")),
                    "known_for_department": person.get("known_for_department")
                })
            
            return people
            
        except httpx.HTTPError as e:
            logger.error(f"Error searching person: {e}")
            return []

    async def get_genres(self) -> List[Dict[str, Any]]:
        """Get list of movie genres, including refined sub-genres"""
        try:
            url = f"{self.base_url}/genre/movie/list"
            params = {"language": "fr-FR"}
            headers = self._get_headers()
            
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            genres = response.json().get("genres", [])
            
            # Add virtual sub-genres
            virtual_genres = [
                {"id": "v_romcom", "name": "Comédie Romantique"},
                {"id": "v_dramady", "name": "Comédie Dramatique"},
                {"id": "v_action_comedy", "name": "Action-Comédie"},
                {"id": "v_horror_comedy", "name": "Comédie Horrifique"},
                {"id": "v_musical_comedy", "name": "Comédie Musicale"},
                {"id": "v_dark_comedy", "name": "Comédie Noire"},
                {"id": "v_parody", "name": "Parodie / Humour Absurde"}
            ]
            
            # Insert after "Comédie" (id 35)
            new_genres = []
            for g in genres:
                new_genres.append(g)
                if g.get("id") == 35:
                    new_genres.extend(virtual_genres)
            
            return new_genres
        except httpx.HTTPError as e:
            logger.error(f"Error fetching genres: {e}")
            return []

    async def discover_movies(
        self, 
        sort_by: str = "vote_average.desc",
        genre_id: Optional[str] = None,
        min_vote_count: int = 500,
        page: int = 1
    ) -> Dict[str, Any]:
        """
        Discover movies with advanced filtering
        """
        try:
            url = f"{self.base_url}/discover/movie"
            # Build params as a list of tuples to support multiple with_genres (AND logic)
            query_params = [
                ("language", "fr-FR"),
                ("sort_by", sort_by),
                ("vote_count.gte", min_vote_count),
                ("page", page),
                ("include_adult", False)
            ]
            
            if genre_id:
                if genre_id == "v_romcom":
                    query_params.extend([("with_genres", "35"), ("with_genres", "10749")])
                elif genre_id == "v_dramady":
                    query_params.extend([("with_genres", "35"), ("with_genres", "18")])
                elif genre_id == "v_action_comedy":
                    query_params.extend([("with_genres", "35"), ("with_genres", "28")])
                elif genre_id == "v_horror_comedy":
                    query_params.extend([("with_genres", "35"), ("with_genres", "27")])
                elif genre_id == "v_musical_comedy":
                    query_params.extend([("with_genres", "35"), ("with_genres", "10402")])
                elif genre_id == "v_dark_comedy":
                    query_params.append(("with_genres", "35"))
                    query_params.append(("with_keywords", "9716")) # dark comedy
                elif genre_id == "v_parody":
                    query_params.append(("with_genres", "35"))
                    query_params.append(("with_keywords", "12248")) # parody
                else:
                    query_params.append(("with_genres", genre_id))
                
            headers = self._get_headers()
            
            response = await self.client.get(url, params=query_params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Format results
            formatted_results = []
            for movie in data.get("results", []):
                formatted_results.append({
                    "id": movie.get("id"),
                    "title": movie.get("title"),
                    "overview": movie.get("overview"),
                    "poster_path": self._get_poster_url(movie.get("poster_path")),
                    "release_date": movie.get("release_date"),
                    "vote_average": movie.get("vote_average"),
                    "genres": [] # IDs are in movie['genre_ids], but we usually resolve them elsewhere or ignore for list views
                })
            
            formatted_results = await self._populate_movie_data(formatted_results)
            
            return {
                "results": formatted_results,
                "page": data.get("page", page),
                "total_pages": data.get("total_pages", 0),
                "total_results": data.get("total_results", 0)
            }
        except httpx.HTTPError as e:
            logger.error(f"Error discovering movies: {e}")
            return {"results": [], "total_pages": 0, "total_results": 0}

    async def get_person_movie_credits(self, person_id: int) -> List[Dict[str, Any]]:
        """Get movie credits for a person"""
        try:
            url = f"{self.base_url}/person/{person_id}/movie_credits"
            params = {"language": "fr-FR"}
            headers = self._get_headers()
            
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            cast_credits = data.get("cast", [])
            
            # Sort by popularity or release date? Let's format first
            formatted_credits = []
            for movie in cast_credits:
                formatted_credits.append({
                    "id": movie.get("id"),
                    "title": movie.get("title"),
                    "overview": movie.get("overview"),
                    "poster_path": self._get_poster_url(movie.get("poster_path")),
                    "release_date": movie.get("release_date"),
                    "vote_average": movie.get("vote_average"),
                    "character": movie.get("character"),
                    "genre_ids": movie.get("genre_ids", []),
                    "popularity": movie.get("popularity", 0)
                })
                
            formatted_credits = await self._populate_movie_data(formatted_credits)
            
            # Sort by vote_average descending by default for "ranking"
            formatted_credits.sort(key=lambda x: x.get("vote_average", 0) or 0, reverse=True)
            
            return formatted_credits
        except httpx.HTTPError as e:
            logger.error(f"Error fetching person credits: {e}")
            return []


# Global instance
tmdb_service = TMDBService()
