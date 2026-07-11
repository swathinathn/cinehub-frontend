import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../utils/axios";
import MovieCard from "../components/MovieCard";

export default function SearchResults() {
  const query = new URLSearchParams(useLocation().search).get("q");
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const response = await API.get(`/movies/list/?search=${query}`);
        setResults(response.data.results || response.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  if (loading) return (
    <div className="movies-page">
      <h2 className="section-title">Searching...</h2>
    </div>
  );

  return (
    <div className="movies-page">
      <h2 className="section-title">
        Search Results for: "{query}"
      </h2>

      {results.length === 0 ? (
        <p className="no-results">No movies found 😕</p>
      ) : (
        <div className="movies-grid">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}