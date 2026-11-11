import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import API from "../utils/axios";
import MovieCard from "../components/MovieCard";

import "./wishlist.css";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("cinehub-user"));
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await API.get("/movies/wishlist/");
        setWishlist(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load wishlist", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, []);

  const removeFromWishlist = async (id) => {
    try {
      setRemovingId(id);

      await API.delete(`/movies/wishlist/${id}/`);

      setWishlist((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Failed to remove movie", err);
      alert("Failed to remove from wishlist.");
    } finally {
      setRemovingId(null);
    }
  };

  // LOGIN REQUIRED

  if (!user) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-message-card">
          <div className="wishlist-message-icon">🔒</div>

          <h2>Login Required</h2>

          <p>
            Please login to access your personal movie wishlist.
          </p>

          <button onClick={() => navigate("/login")}>
            Login Now →
          </button>
        </div>
      </div>
    );
  }

  // LOADING

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <div className="wishlist-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // EMPTY WISHLIST

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">

          <div className="wishlist-empty-icon">
            ❤️
          </div>

          <h2>Your Wishlist is Empty</h2>

          <p>
            Your favourite movies deserve a place here.
            Start exploring and save the movies you love!
          </p>

          <button
            className="wishlist-browse-btn"
            onClick={() => navigate("/movies")}
          >
            🎬 Explore Movies
          </button>

        </div>
      </div>
    );
  }

  // WISHLIST PAGE

  return (
    <div className="wishlist-page">

      <div className="wishlist-container">

        {/* PAGE HEADER */}

        <div className="wishlist-header">

          <div>
            <span className="wishlist-eyebrow">
              YOUR PERSONAL COLLECTION
            </span>

            <h1>
              My <span>Wishlist</span> ❤️
            </h1>

            <p>
              All your favourite movies, together in one place.
            </p>
          </div>

          <div className="wishlist-count">
            <span>{wishlist.length}</span>
            <small>
              {wishlist.length === 1 ? "Movie Saved" : "Movies Saved"}
            </small>
          </div>

        </div>

        {/* MOVIE GRID */}

        <div className="wishlist-grid">

          {wishlist.map((item) => (
            <div
              key={item.id}
              className="wishlist-movie"
            >

              <MovieCard movie={item.movie} />

              <button
                className="wishlist-remove-btn"
                onClick={() => removeFromWishlist(item.id)}
                disabled={removingId === item.id}
                title="Remove from wishlist"
              >
                {removingId === item.id ? (
                  "Removing..."
                ) : (
                  <>
                    <span>♥</span> Remove
                  </>
                )}
              </button>

            </div>
          ))}

        </div>

        {/* BOTTOM MESSAGE */}

        <div className="wishlist-footer">
          <p>
            ❤️ Keep discovering movies you'll love.
          </p>

          <button onClick={() => navigate("/movies")}>
            Discover More Movies →
          </button>
        </div>

      </div>

    </div>
  );
}