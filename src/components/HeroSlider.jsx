import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import formatDuration from "../utils/formatDuration";
import { mediaUrl, getYouTubeId } from "../utils/media";
import "./heroSlider.css";

const IMAGE_MS = 7000;
const TRAILER_MS = 22000;
const TRAILER_DELAY_MS = 1800;
const YT_ORIGIN = "https://www.youtube.com";

const LABELS = {
  in_theatres: "Now showing",
  ott: "Streaming now",
  coming_soon: "Coming soon",
};

export default function HeroSlider({ movies = [] }) {
  const navigate = useNavigate();

  const slides = useMemo(
    () => movies.filter((m) => m.banner || m.poster).slice(0, 5),
    [movies]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [trailerOn, setTrailerOn] = useState(false);
  const [trailerShown, setTrailerShown] = useState(false);
  const [muted, setMuted] = useState(true);

  const ytRef = useRef(null);
  const fadeTimer = useRef(null);

  // Trailers autoplay only on desktop and when the user hasn't asked for less motion
  const canAutoplay = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return (
      window.matchMedia("(min-width: 769px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const current = slides.length ? index % slides.length : 0;
  const movie = slides[current] || null;
  const ytId = movie ? getYouTubeId(movie.trailer_url) : null;
  const trailerCapable = canAutoplay && Boolean(ytId);
  const duration = trailerCapable ? TRAILER_MS : IMAGE_MS;

  // New slide: reset the trailer, then start it after a short delay
  useEffect(() => {
    setTrailerOn(false);
    setTrailerShown(false);
    setMuted(true);
    clearTimeout(fadeTimer.current);

    if (!trailerCapable) return;

    const t = setTimeout(() => setTrailerOn(true), TRAILER_DELAY_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(fadeTimer.current);
    };
  }, [movie?.id, trailerCapable]);

  // Auto-advance (restarts after a pause or a manual change)
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      duration
    );
    return () => clearTimeout(t);
  }, [current, paused, cycle, duration, slides.length]);

  if (!movie) return null;

  const goTo = (i) => {
    setIndex(i);
    setCycle((c) => c + 1);
  };
  const next = () => goTo((current + 1) % slides.length);
  const prev = () => goTo((current - 1 + slides.length) % slides.length);

  const postYT = (func, args = "") => {
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YT_ORIGIN
    );
  };

  const toggleMute = () => {
    if (muted) {
      postYT("unMute");
      postYT("setVolume", [80]);
    } else {
      postYT("mute");
    }
    setMuted((m) => !m);
  };

  const onEnter = (e) => {
    if (e.pointerType === "mouse") setPaused(true);
  };
  const onLeave = (e) => {
    if (e.pointerType === "mouse") {
      setPaused(false);
      setCycle((c) => c + 1);
    }
  };

  const isComing = movie.category === "coming_soon";

  const onPrimary = () => {
    if (movie.category === "in_theatres") {
      const user = JSON.parse(localStorage.getItem("cinehub-user"));
      if (!user) {
        window.dispatchEvent(new Event("open-login"));
        return;
      }
      navigate(`/book/${movie.id}`);
    } else if (movie.category === "ott" && movie.platform_url) {
      window.open(movie.platform_url, "_blank", "noopener");
    } else {
      navigate(`/movies/${movie.id}`);
    }
  };

  const primaryLabel =
    movie.category === "in_theatres"
      ? "🎟️ Book tickets"
      : movie.category === "ott"
      ? "▶ Watch now"
      : "ℹ️ View details";

  const ytSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}` +
      `&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1` +
      `&origin=${encodeURIComponent(window.location.origin)}`
    : "";

  return (
    <section
      className="hero"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      aria-roledescription="carousel"
    >
      {/* BACKGROUNDS + TRAILER */}
      <div className="hero-media">
        {slides.map((m, i) => (
          <div
            key={m.id}
            className={`hero-bg ${i === current ? "active" : ""}`}
            style={{ backgroundImage: `url(${mediaUrl(m.banner || m.poster)})` }}
          />
        ))}

        {trailerOn && ytId && (
          <div className={`hero-trailer ${trailerShown ? "show" : ""}`}>
            <iframe
              key={movie.id}
              ref={ytRef}
              src={ytSrc}
              title={`${movie.title} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => {
                clearTimeout(fadeTimer.current);
                fadeTimer.current = setTimeout(() => setTrailerShown(true), 1400);
              }}
            />
          </div>
        )}
      </div>

      <div className="hero-shade" />

      {/* CONTENT */}
      <div className="hero-layer">
        <div className="hero-wrap">
          <div className="hero-content" key={movie.id}>
            <span className={`hero-tag ${movie.category}`}>
              <i /> {LABELS[movie.category] || "Featured"}
            </span>

            <h1 className="hero-title">{movie.title}</h1>

            <div className="hero-meta">
              {movie.rating > 0 && (
                <span className="hero-chip rating">⭐ {movie.rating}</span>
              )}
              {movie.language && <span className="hero-chip">{movie.language}</span>}
              {movie.duration > 0 && (
                <span className="hero-chip">{formatDuration(movie.duration)}</span>
              )}
              {movie.release_date && (
                <span className="hero-chip">{movie.release_date.slice(0, 4)}</span>
              )}
              {movie.genre?.slice(0, 3).map((g) => (
                <span className="hero-chip soft" key={g.id}>
                  {g.name}
                </span>
              ))}
            </div>

            {movie.description && <p className="hero-desc">{movie.description}</p>}

            <div className="hero-actions">
              <button className="hero-btn primary" onClick={onPrimary}>
                {primaryLabel}
              </button>

              {!isComing && (
                <button
                  className="hero-btn ghost"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  More info
                </button>
              )}

              {trailerShown && (
                <button
                  className="hero-icon-btn"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute trailer" : "Mute trailer"}
                  title={muted ? "Turn sound on" : "Turn sound off"}
                >
                  {muted ? "🔇" : "🔊"}
                </button>
              )}
            </div>
          </div>

          {/* UP NEXT */}
          {slides.length > 1 && (
            <div className="hero-thumbs">
              {slides.map((m, i) => (
                <button
                  key={m.id}
                  className={`hero-thumb ${i === current ? "active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Show ${m.title}`}
                  title={m.title}
                >
                  <img
                    src={mediaUrl(m.poster || m.banner)}
                    alt=""
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ARROWS + DOTS */}
      {slides.length > 1 && (
        <>
          <button className="hero-nav left" onClick={prev} aria-label="Previous">
            ‹
          </button>
          <button className="hero-nav right" onClick={next} aria-label="Next">
            ›
          </button>

          <div className="hero-dots">
            {slides.map((m, i) => (
              <button
                key={m.id}
                className={`hero-dot ${i === current ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === current && (
                  <span
                    key={`${current}-${cycle}`}
                    className="hero-progress"
                    style={{
                      animationDuration: `${duration}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}