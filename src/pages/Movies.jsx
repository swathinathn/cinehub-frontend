import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import API from "../utils/axios";
import "./movies.css";

export default function Movies() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const genre = params.get("genre");
  const language = params.get("language");

  const [theatreMovies, setTheatreMovies] = useState([]);
  const [ottMovies, setOttMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let filters = "";
        if (language) filters += `language=${language}&`;
        if (genre) filters += `genre_name=${genre}&`;

        const [theatreRes, ottRes, comingRes] = await Promise.all([
          API.get(`/movies/list/?category=in_theatres&page_size=100&${filters}`),
          API.get(`/movies/list/?category=ott&page_size=100&${filters}`),
          API.get(`/movies/list/?category=coming_soon&page_size=100&${filters}`),
        ]);

        setTheatreMovies((theatreRes.data.results || theatreRes.data).slice(0, 20));
        setOttMovies((ottRes.data.results || ottRes.data).slice(0, 20));
        setComingSoonMovies((comingRes.data.results || comingRes.data).slice(0, 20));
      } catch (err) {
        console.error("Movies fetch error:", err);
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [genre, language]);

  const totalMovies = theatreMovies.length + ottMovies.length + comingSoonMovies.length;

  if (loading) return <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>Loading movies...</div>;
  if (error) return <div style={{ color: "red", textAlign: "center", marginTop: "100px" }}>{error}</div>;

  return (
    <div className="movies-page">
      <div className="movies-container">

        {(genre || language) && (
          <p style={{ color: "#aaa", marginBottom: "20px" }}>
            Showing results for <strong>{genre || language}</strong>
          </p>
        )}

        {theatreMovies.length > 0 && (
          <>
            <h2 className="section-title">🎬 In Cinemas</h2>
            <div className="movies-grid">
              {theatreMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}

        {ottMovies.length > 0 && (
          <>
            <h2 className="section-title">📺 OTT Releases</h2>
            <div className="movies-grid">
              {ottMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}

        {comingSoonMovies.length > 0 && (
          <>
            <h2 className="section-title">🆕 Coming Soon</h2>
            <div className="movies-grid">
              {comingSoonMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}

        {totalMovies === 0 && (
          <p style={{ color: "#888", marginTop: "40px" }}>
            No movies found for this filter.
          </p>
        )}

      </div>
    </div>
  );
}