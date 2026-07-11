import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";
import API from "../utils/axios";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [moviesRes, trendingRes] = await Promise.all([
          API.get("/movies/list/?page_size=1000"),
          API.get("/movies/list/trending/"),
        ]);
        setMovies(moviesRes.data.results || moviesRes.data);
        setTrendingMovies(trendingRes.data);
      } catch (err) {
        console.error("Failed to load movies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const ottMovies = movies.filter((m) => m.category === "ott").slice(0, 6);
  const comingSoon = movies.filter((m) => m.category === "coming_soon").slice(0, 6);
  const inTheatres = movies.filter((m) => m.category === "in_theatres").slice(0, 6);

  const sliderMovies = trendingMovies.filter((m) => m.poster || m.banner);

  const RowSection = ({ title, data }) => {
    if (data.length === 0) return null;
    return (
      <section className="home-row">
        <div className="home-section-header">
          <h2 className="home-section-title">{title}</h2>
          <button className="view-more" onClick={() => navigate("/movies")}>
            View More →
          </button>
        </div>
        <div className="scroll-row">
          {data.map((movie) => (
            <div key={movie.id} className="home-card-wrapper">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (loading) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "200px", fontSize: "20px" }}>
      🎬 Loading...
    </div>
  );

  return (
    <div className="home-page">
      <HeroSlider movies={sliderMovies} />
      <RowSection title="🔥 Trending Now" data={trendingMovies} />
      <RowSection title="🎬 In Cinemas" data={inTheatres} />
      <RowSection title="📺 Watch Online" data={ottMovies} />
      <RowSection title="🆕 Coming Soon" data={comingSoon} />
    </div>
  );
}