import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../utils/axios";
import formatDuration from "../utils/formatDuration";
import "./MovieCard.css";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);

  const handleBook = (e) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem("cinehub-user"));
    if (!user) {
      window.dispatchEvent(new Event("open-login"));
      return;
    }
    navigate(`/book/${movie.id}`);
  };

  const handleWatch = (e) => {
    e.stopPropagation();
    if (movie.platformUrl) window.open(movie.platformUrl, "_blank");
  };

 const toggleWishlist = async (e) => {
  e.stopPropagation();
  const user = JSON.parse(localStorage.getItem("cinehub-user"));
  if (!user) {
    window.dispatchEvent(new Event("open-login"));
    return;
  }
  try {
    if (wishlisted) {
      // Find the wishlist entry and delete it
      const res = await API.get("/movies/wishlist/");
      const items = res.data.results || res.data;
      const entry = items.find(w => w.movie.id === movie.id);
      if (entry) {
        await API.delete(`/movies/wishlist/${entry.id}/`);
      }
      setWishlisted(false);
    } else {
      await API.post("/movies/wishlist/", { movie_id: movie.id });
      setWishlisted(true);
    }
  } catch (err) {
    console.error("Wishlist error", err);
  }
};

  const posterUrl = movie.poster?.startsWith("http")
    ? movie.poster
    : `http://127.0.0.1:8000${movie.poster}`;

  return (
    <div className="movie-card" onClick={() => navigate(`/movies/${movie.id}`)}>
      <div className="movie-poster-wrapper">
        <img
          src={posterUrl}
          className="movie-poster"
          alt={movie.title}
          onError={(e) => { e.target.src = "/placeholder.jpg"; }}
        />

        <div className="movie-poster-overlay">
          <span className="movie-overlay-rating">⭐ {movie.rating || "N/A"}</span>
        </div>

        {/* WISHLIST BUTTON */}
        <button
          className="wishlist-btn"
          onClick={toggleWishlist}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>

        {movie.category === "coming_soon" && (
          <div className="movie-badge">Soon</div>
        )}
        {movie.category === "ott" && (
          <div className="movie-badge ott-badge">OTT</div>
        )}
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-meta">
          {movie.language}
          {movie.duration ? ` • ${formatDuration(movie.duration)}` : ""}
        </p>

        {movie.category === "in_theatres" && (
          <button className="movie-action-btn book-btn" onClick={handleBook}>
            🎟️ Book Tickets
          </button>
        )}
        {movie.category === "ott" && (
          <button className="movie-action-btn watch-btn" onClick={handleWatch}>
            ▶ Watch Now
          </button>
        )}
        {movie.category === "coming_soon" && (
          <div className="movie-action-btn coming-btn">
            🔔 Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}