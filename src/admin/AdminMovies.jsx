import React, { useState, useEffect } from "react";
import API from "../utils/axios";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await API.get("/movies/list/?page_size=1000");
      setMovies(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    try {
      await API.delete(`/movies/list/${id}/`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete movie.");
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>🎬 Movie Management</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#16213e", color: "#fff" }}>
            <th style={th}>Poster</th>
            <th style={th}>Title</th>
            <th style={th}>Language</th>
            <th style={th}>Category</th>
            <th style={th}>Rating</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id} style={{ borderBottom: "1px solid #333" }}>
              <td style={td}>
                <img
                  src={movie.poster?.startsWith("http") ? movie.poster : `http://127.0.0.1:8000${movie.poster}`}
                  alt={movie.title}
                  style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px" }}
                />
              </td>
              <td style={{ ...td, color: "#fff" }}>{movie.title}</td>
              <td style={td}>{movie.language}</td>
              <td style={td}>{movie.category?.replace("_", " ")}</td>
              <td style={td}>⭐ {movie.rating}</td>
              <td style={td}>
                <button
                  onClick={() => deleteMovie(movie.id)}
                  style={{ background: "#e50914", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: "12px 16px", textAlign: "left", color: "#aaa" };
const td = { padding: "12px 16px", color: "#ccc" };