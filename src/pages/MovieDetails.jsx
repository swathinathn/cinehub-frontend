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
  const [showTrailer, setShowTrailer] = useState(false);

  // Safely read logged-in user
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("cinehub-user"));
    } catch {
      return null;
    }
  };

  // YouTube ID extractor
  const getYouTubeId = (url) => {
    if (!url) return null;

    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );

    return match ? match[1] : null;
  };

  // Check whether trailer is a video file
  const isVideoFile = (url) => {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || "");
  };

  // Media URL helper
  const getMediaUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("http")) {
      return url;
    }

    return `${BACKEND_URL}$${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);

        const response = await API.get(`/movies/list/${id}/`);

        setMovie(response.data);

        const allMovies = await API.get("/movies/list/");

        const all = allMovies.data.results || allMovies.data;

        setSimilarMovies(
          all
            .filter(
              (m) =>
                m.category === response.data.category &&
                m.id !== response.data.id
            )
            .slice(0, 6)
        );
      } catch (err) {
        console.error("Failed to load movie details", err);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="details-loading">
        <div className="details-spinner"></div>
        <p>Preparing your movie experience...</p>
      </div>
    );
  }

  // Movie not found
  if (!movie) {
    return (
      <div className="details-not-found">
        <h2>🎬 Movie Not Found</h2>
        <p>Sorry, we couldn't find this movie.</p>

        <button onClick={() => navigate("/movies")}>
          Browse Movies
        </button>
      </div>
    );
  }

  const user = getUser();

  const trailerUrl = movie.trailer_url || "";
  const youtubeId = getYouTubeId(trailerUrl);
  const localVideo = isVideoFile(trailerUrl);

  const hasTrailer = Boolean(youtubeId || localVideo);

  const posterUrl = getMediaUrl(movie.poster);

  const bannerUrl = movie.banner
    ? getMediaUrl(movie.banner)
    : posterUrl;

  // Booking
  const handleBook = () => {
    if (!user) {
      window.dispatchEvent(new Event("open-login"));
      return;
    }

    navigate(`/book/${movie.id}`);
  };

  // Trailer modal
  const closeTrailer = () => {
    setShowTrailer(false);
  };

  return (
    <div className="movie-details-page">

      {/* BACKDROP */}

      <div className="details-backdrop">

        <img
          src={bannerUrl}
          alt={movie.title}
          className="details-backdrop-img"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />

        <div className="details-backdrop-gradient"></div>

      </div>

      {/* HERO */}

      <section className="details-hero">

        <div className="details-hero-left">

          <div className="details-poster-wrapper">

            <img
              src={posterUrl}
              alt={movie.title}
              className="details-poster"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />

          </div>

        </div>

        <div className="details-hero-right">

          <span className="details-eyebrow">
            CINEHUB ORIGINAL EXPERIENCE
          </span>

          <h1 className="details-title">
            {movie.title}
          </h1>

          {/* RATING */}

          <div className="details-rating-row">

            <div className="details-rating">
              {movie.rating || "N/A"}
            </div>

            <span className="details-votes">
              User Rating
            </span>

          </div>

          {/* MOVIE META */}

          <div className="details-meta">

            <span className="meta-item">
              {movie.language}
            </span>

            <span className="meta-dot"></span>

            <span className="meta-item">
              {formatDuration(movie.duration)}
            </span>

            <span className="meta-dot"></span>

            <span className="meta-item">
              {movie.release_date}
            </span>

          </div>

          {/* GENRES */}

          <div className="details-tags">

            <span className="tag tag-category">
              {movie.category?.replaceAll("_", " ")}
            </span>

            {movie.genre?.map((g) => (
              <span className="tag" key={g.id}>
                {g.name}
              </span>
            ))}

          </div>

          {/* ACTION BUTTONS */}

          <div className="details-actions">

            {movie.category === "in_theatres" && (
              <button
                className="book-ticket-btn"
                onClick={handleBook}
              >
                🎟️ Book Tickets
              </button>
            )}

            {movie.category === "ott" && (
              <button
                className="watch-btn"
                onClick={() =>
                  movie.platform_url
                    ? window.open(
                      movie.platform_url,
                      "_blank",
                      "noopener,noreferrer"
                    )
                    : alert("Watch link not available yet.")
                }
              >
                ▶ Watch Online
              </button>
            )}

            {movie.category === "coming_soon" && (
              <div className="coming-label">
                🎬 Coming Soon
              </div>
            )}

            {hasTrailer && (
              <button
                className="trailer-btn"
                onClick={() => setShowTrailer(true)}
              >
                ▶ Watch Trailer
              </button>
            )}

          </div>

        </div>

      </section>

      {/* MOVIE INFORMATION */}

      <section className="details-info-section">

        <div className="about-movie-section">

          <h2>About the Movie</h2>

          <p className="about-text">
            {movie.description || "Description not available."}
          </p>

        </div>

        <div className="movie-info-card">

          <h3>Movie Information</h3>

          <div className="info-row">
            <span className="info-label">Language</span>
            <span className="info-value">{movie.language}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Duration</span>
            <span className="info-value">
              {formatDuration(movie.duration)}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Release</span>
            <span className="info-value">
              {movie.release_date}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Rating</span>
            <span className="info-value">
              ⭐ {movie.rating || "N/A"}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Genre</span>
            <span className="info-value">
              {movie.genre?.map((g) => g.name).join(", ") || "N/A"}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Status</span>
            <span className="info-value info-status">
              {movie.category?.replaceAll("_", " ")}
            </span>
          </div>

        </div>

      </section>

      {/* CAST AND CREW */}

      {movie.cast_crew?.length > 0 && (

        <section className="cast-crew-section">

          <h2>Cast & Crew</h2>

          <div className="cast-crew-grid">

            {movie.cast_crew.map((person) => {

              const photoUrl = person.photo
                ? getMediaUrl(person.photo)
                : null;

              return (

                <div key={person.id} className="cast-card">

                  {photoUrl ? (

                    <img
                      src={photoUrl}
                      alt={person.name}
                      className="cast-photo"
                    />

                  ) : (

                    <div className="cast-photo-placeholder">
                      {person.name?.[0]?.toUpperCase()}
                    </div>

                  )}

                  <p className="cast-name">
                    {person.name}
                  </p>

                  <p className="cast-role">

                    {person.role === "actor" && person.character_name
                      ? `as ${person.character_name}`
                      : person.role
                        ?.charAt(0)
                        .toUpperCase() +
                      person.role?.slice(1)}

                  </p>

                </div>

              );
            })}

          </div>

        </section>

      )}

      {/* SIMILAR MOVIES */}

      {similarMovies.length > 0 && (

        <section className="similar-movies-section">

          <h2>You Might Also Like</h2>

          <div className="similar-movies-grid">

            {similarMovies.map((similar) => (

              <MovieCard
                key={similar.id}
                movie={similar}
              />

            ))}

          </div>

        </section>

      )}

      {/* TRAILER MODAL */}

      {showTrailer && (

        <div
          className="trailer-modal-bg"
          onClick={closeTrailer}
        >

          <div
            className="trailer-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="trailer-close"
              onClick={closeTrailer}
            >
              ✕
            </button>

            {/* YOUTUBE */}

            {youtubeId && (

              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

            )}

            {/* LOCAL MP4 / WEBM */}

            {localVideo && (

              <video
                src={getMediaUrl(trailerUrl)}
                controls
                autoPlay
                playsInline
                className="details-trailer-video"
              >
                Your browser does not support video playback.
              </video>

            )}

          </div>

        </div>

      )}

    </div>
  );
}