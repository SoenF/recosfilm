const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  /**
   * Search for movies by title
   */
  async searchMovies(query, page = 1) {
    const response = await fetch(
      `${API_BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}`
    );

    if (!response.ok) {
      throw new Error('Failed to search movies');
    }

    return response.json();
  }

  /**
   * Search for people (actors)
   */
  async searchPerson(query) {
    const response = await fetch(
      `${API_BASE_URL}/search/person?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Failed to search person');
    }

    return response.json();
  }

  /**
   * Get movie details
   */
  async getMovieDetails(movieId) {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}`);

    if (!response.ok) {
      throw new Error('Failed to get movie details');
    }

    return response.json();
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page = 1) {
    const response = await fetch(`${API_BASE_URL}/popular?page=${page}`);

    if (!response.ok) {
      throw new Error('Failed to get popular movies');
    }

    return response.json();
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(likedMovies, topK = 10, filters = null) {
    const response = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        liked_movies: likedMovies,
        top_k: topK,
        filters: filters,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get recommendations');
    }

    return response.json();
  }

  /**
   * Get API status
   */
  async getStatus() {
    const response = await fetch(`${API_BASE_URL}/status`);

    if (!response.ok) {
      throw new Error('Failed to get status');
    }

    return response.json();
  }

  /**
   * Initialize the system with popular movies
   */
  async initializeSystem(numMovies = 500) {
    const response = await fetch(`${API_BASE_URL}/initialize?num_movies=${numMovies}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to initialize system');
    }

    return response.json();
  }

  /**
   * Get genres list
   */
  async getGenres() {
    const response = await fetch(`${API_BASE_URL}/genres`);
    if (!response.ok) throw new Error('Failed to get genres');
    return response.json();
  }

  /**
   * Discover movies (Top 50 etc)
   */
  async discoverMovies(params) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/discover?${queryParams}`);
    if (!response.ok) throw new Error('Failed to discover movies');
    return response.json();
  }

  /**
   * Get movies for a person
   */
  async getPersonMovies(personId) {
    const response = await fetch(`${API_BASE_URL}/person/${personId}/movies`);
    if (!response.ok) throw new Error('Failed to get person movies');
    return response.json();
  }
}

export default new ApiService();
