import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import API from "../utils/axios";
import formatDuration from "../utils/formatDuration";
import "./movieDetails.css";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/movies/list/${id}/`);
        setMovie(response.data);
        const allMovies = await API.get(`/movies/list/`);
        const all = allMovies.data.results || allMovies.data;
        setSimilarMovies(
          all.filter(m => m.category === response.data.category && m.id !== response.data.id).slice(0, 6)
        );
      } catch (err) {
        console.error("Failed to load movie details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "200px", fontSize: "20px" }}>
      🎬 Loading...
    </div>
  );

  if (!movie) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "200px" }}>
      Movie not found.
    </div>
  );

  const user = JSON.parse(localStorage.getItem("cinehub-user"));

  const handleBook = () => {
    if (!user) { window.dispatchEvent(new Event("open-login")); return; }
    navigate(`/book/${movie.id}`);
  };

  const posterUrl = movie.poster?.startsWith("http")
    ? movie.poster : `http://127.0.0.1:8000${movie.poster}`;

  const bannerUrl = movie.banner
    ? (movie.banner.startsWith("http") ? movie.banner : `http://127.0.0.1:8000${movie.banner}`)
    : posterUrl;

  return (
    <div className="movie-details-page">

      {/* BACKDROP */}
      <div className="details-backdrop">
        <img src={bannerUrl} alt={movie.title} className="details-backdrop-img" />
        <div className="details-backdrop-gradient" />
      </div>

      {/* HERO */}
      <div className="details-hero">
        <div className="details-hero-left">
          <img
            src={posterUrl}
            alt={movie.title}
            className="details-poster"
            onError={(e) => { e.target.src = "/placeholder.jpg"; }}
          />
        </div>

        <div className="details-hero-right">
          <h1 className="details-title">{movie.title}</h1>

          <div className="details-rating-row">
            <div className="details-rating">{movie.rating || "N/A"}</div>
            <span className="details-votes">User Rating</span>
          </div>

          <div className="details-meta">
            <span className="meta-item">{movie.language}</span>
            <span className="meta-dot"></span>
            <span className="meta-item">{formatDuration(movie.duration)}</span>
            <span className="meta-dot"></span>
            <span className="meta-item">{movie.release_date}</span>
          </div>

          <div className="details-tags">
            <span className={`tag tag-category`}>
              {movie.category?.replace("_", " ")}
            </span>
            {movie.genre?.map((g) => (
              <span className="tag" key={g.id}>{g.name}</span>
            ))}
          </div>

          <div className="details-actions">
            {movie.category === "in_theatres" && (
              <button className="book-ticket-btn" onClick={handleBook}>
                🎟️ Book Tickets
              </button>
            )}
            {movie.category === "ott" && (
              <button className="watch-btn" onClick={() => movie.platformUrl && window.open(movie.platformUrl, "_blank")}>
                ▶ Watch Online
              </button>
            )}
            {movie.category === "coming_soon" && (
              <div className="coming-label">🎬 Coming Soon</div>
            )}
            {movie.trailer_url && (
              <a href={movie.trailer_url} target="_blank" rel="noreferrer" className="trailer-btn">
                🎬 Watch Trailer
              </a>
            )}
          </div>
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="details-info-section">
        <div className="about-movie-section">
          <h2>About the Movie</h2>
          <p className="about-text">
            {movie.description || "Description not available."}
          </p>
        </div>

        <div className="movie-info-card">
          <h3>Movie Info</h3>
          <div className="info-row">
            <span className="info-label">Language</span>
            <span className="info-value">{movie.language}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Duration</span>
            <span className="info-value">{formatDuration(movie.duration)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Release</span>
            <span className="info-value">{movie.release_date}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rating</span>
            <span className="info-value">⭐ {movie.rating}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Genre</span>
            <span className="info-value">
              {movie.genre?.map(g => g.name).join(", ")}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Status</span>
            <span className="info-value" style={{ color: "#f84464", textTransform: "capitalize" }}>
              {movie.category?.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* SIMILAR MOVIES */}
      {similarMovies.length > 0 && (
        <div className="similar-movies-section">
          <h2>You Might Also Like</h2>
          <div className="similar-movies-grid">
            {similarMovies.map(similar => (
              <MovieCard key={similar.id} movie={similar} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}