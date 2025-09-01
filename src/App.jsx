import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [typeFilter, setTypeFilter] = useState(""); // movie, series, episode
  const [yearFilter, setYearFilter] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const API_KEY = "65beafe5";

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch movies from OMDb
  const fetchMovies = async () => {
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      let url = `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (yearFilter) url += `&y=${yearFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.Response === "True") {
        setMovies(data.Search);
      } else {
        setMovies([]);
        setError("No results found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch movies.");
    }
    setLoading(false);
  };

  // Autocomplete suggestions (first 5 results)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
        const data = await res.json();
        if (data.Response === "True") {
          setSuggestions(data.Search.slice(0, 5));
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [query]);

  const toggleFavorite = (movie) => {
    if (favorites.find((m) => m.imdbID === movie.imdbID)) {
      setFavorites(favorites.filter((m) => m.imdbID !== movie.imdbID));
    } else {
      setFavorites([...favorites, movie]);
    }
  };

  return (
    <div className="app-card">
      <h1>Movie Search App</h1>

      <div className="input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
        />
        <button onClick={fetchMovies}>Search</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All</option>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
          <option value="episode">Episode</option>
        </select>
        <input
          type="number"
          placeholder="Year"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        />
      </div>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s) => (
            <div key={s.imdbID} onClick={() => setQuery(s.Title)}>
              {s.Title} ({s.Year})
            </div>
          ))}
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {/* Movies */}
      <div className="movies">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie-card">
            <img
              src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150"}
              alt={movie.Title}
              onClick={() => setSelectedMovie(movie)}
            />
            <h3>{movie.Title}</h3>
            <p>{movie.Year}</p>
            <button
              className="fav-btn"
              onClick={() => toggleFavorite(movie)}
            >
              {favorites.find((m) => m.imdbID === movie.imdbID) ? "★" : "☆"}
            </button>
          </div>
        ))}
      </div>

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="modal" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMovie.Title}</h2>
            <img
              src={selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : "https://via.placeholder.com/150"}
              alt={selectedMovie.Title}
            />
            <p>Year: {selectedMovie.Year}</p>
            <p>Type: {selectedMovie.Type}</p>
            <button onClick={() => setSelectedMovie(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
