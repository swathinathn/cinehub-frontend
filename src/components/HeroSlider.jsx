import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./heroSlider.css";
import formatDuration from "../utils/formatDuration";
export default function HeroSlider({ movies = [] }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // Use movies that have a poster
  const sliderMovies = movies.filter((m) => m.banner);

  useEffect(() => {
    if (!sliderMovies.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % sliderMovies.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sliderMovies.length]);

  if (!sliderMovies.length) return null;


    const handleBook = (e) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem("cinehub-user"));
    if (!user) {
      window.dispatchEvent(new Event("open-login"));
      return;
    }
    navigate(`/book/${movie.id}`);
  };

  const movie = sliderMovies[index % sliderMovies.length];

  const bannerUrl = movie.banner?.startsWith("http")
    ? movie.banner
    : `http://127.0.0.1:8000${movie.banner}`;

  return (
    <div className="hero-slider">
      <img
        src={bannerUrl}
        alt={movie.title}
        onError={(e) => { e.target.src = "/placeholder.jpg"; }}
      />
      
      <div className="hero-overlay">
        <h1>{movie.title}</h1>
        <p>{movie.language} •{formatDuration(movie.duration)}</p>
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          {movie.category === "in_theatres" && (
            <button
              onClick={handleBook}
              style={{
                background: "#e50914", color: "#fff", border: "none",
                padding: "12px 28px", borderRadius: "8px",
                fontSize: "16px", cursor: "pointer", fontWeight: "bold"
              }}
            >
              🎟️ Book Tickets
            </button>
          )}
          <button
            onClick={() => navigate(`/movies/${movie.id}`)}
            style={{
              background: "rgba(255,255,255,0.2)", color: "#fff",
              border: "1px solid #fff", padding: "12px 28px",
              borderRadius: "8px", fontSize: "16px", cursor: "pointer"
            }}
          >
            ℹ More Info
          </button>
        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          {sliderMovies.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? "24px" : "8px",
                height: "8px", borderRadius: "4px",
                background: i === index ? "#e50914" : "rgba(255,255,255,0.5)",
                cursor: "pointer", transition: "all 0.3s"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}