import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    release_date: "",
    language: "",
    rating: "0.0",
    category: "in_theatres",
    trailer_url: "",
    platform_url: "",
    is_active: true,
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/movies/list/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setMovies(res.data.results || res.data);
      if (res.data.count) {
        setTotalPages(Math.ceil(res.data.count / ROWS_PER_PAGE));
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await API.get("/movies/genres/?page_size=1000");
      setGenres(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load genres", err);
    }
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie? This will also delete related showtimes and bookings!")) return;
    try {
      await API.delete(`/movies/list/${id}/`);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete movie.");
    }
  };

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setForm({
      title: "",
      description: "",
      duration: "",
      release_date: "",
      language: "",
      rating: "0.0",
      category: "in_theatres",
      trailer_url: "",
      platform_url: "",
      is_active: true,
    });
    setSelectedGenres([]);
    setPosterFile(null);
    setBannerFile(null);
    setModalOpen(true);
  };
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const generateDescription = async () => {
    if (!form.title) {
      alert("Please enter a movie title first.");
      return;
    }
    setGeneratingDesc(true);
    try {
      const genreNames = genres
        .filter(g => selectedGenres.includes(g.id))
        .map(g => g.name);

      const res = await API.post("/movies/generate-description/", {
        title: form.title,
        genres: genreNames,
        language: form.language || "movie",
      });
      setForm({ ...form, description: res.data.description });
    } catch (err) {
      alert("AI generation failed. Please write manually.");
    } finally {
      setGeneratingDesc(false);
    }
  };
  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title || "",
      description: movie.description || "",
      duration: movie.duration || "",
      release_date: movie.release_date || "",
      language: movie.language || "",
      rating: movie.rating || "0.0",
      category: movie.category || "in_theatres",
      trailer_url: movie.trailer_url || "",
      platform_url: movie.platform_url || "",
      is_active: movie.is_active ?? true,
    });
    setSelectedGenres(movie.genre ? movie.genre.map((g) => g.id) : []);
    setPosterFile(null);
    setBannerFile(null);
    setModalOpen(true);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.duration || !form.release_date || !form.language) {
      alert("Please fill in all required fields (Title, Duration, Release Date, Language).");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("duration", form.duration);
      formData.append("release_date", form.release_date);
      formData.append("language", form.language);
      formData.append("rating", form.rating);
      formData.append("category", form.category);
      formData.append("trailer_url", form.trailer_url);
      formData.append("platform_url", form.platform_url);
      formData.append("is_active", form.is_active);

      selectedGenres.forEach((id) => formData.append("genre_ids", id));

      if (posterFile) {
        formData.append("poster", posterFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      const headers = { "Content-Type": "multipart/form-data" };

      if (editingMovie) {
        await API.patch(`/movies/list/${editingMovie.id}/`, formData, { headers });
      } else {
        if (!posterFile) {
          alert("A poster image is required for new movies.");
          setSubmitting(false);
          return;
        }
        await API.post("/movies/list/", formData, { headers });
      }

      setModalOpen(false);
      fetchMovies();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "An error occurred while saving the movie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="admin-page">Loading...</p>;

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="admin-header" style={{ margin: 0 }}>🎬 Movie Management</h2>
        <button onClick={handleOpenAdd} className="admin-btn-primary">
          ➕ Add New Movie
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#0e0e1a", borderRadius: "12px", overflow: "hidden" }}>
        <thead>
          <tr style={{ background: "#16213e", color: "#fff" }}>
            <th style={th}>Poster</th>
            <th style={th}>Title</th>
            <th style={th}>Language</th>
            <th style={th}>Category</th>
            <th style={th}>Rating</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id} style={{ borderBottom: "1px solid #222" }}>
              <td style={td}>
                <img
                  src={movie.poster?.startsWith("http") ? movie.poster : `${BACKEND_URL}$${movie.poster}`}
                  alt={movie.title}
                  style={{ width: "52px", height: "76px", objectFit: "cover", borderRadius: "6px" }}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/150x220/222/fff?text=No+Poster";
                  }}
                />
              </td>
              <td style={{ ...td, color: "#fff", fontWeight: "600" }}>{movie.title}</td>
              <td style={td}>{movie.language}</td>
              <td style={td}>{movie.category?.replace("_", " ").toUpperCase()}</td>
              <td style={td}>⭐ {movie.rating}</td>
              <td style={td}>
                <span style={{
                  padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
                  background: movie.is_active ? "rgba(76,175,80,0.15)" : "rgba(229,9,20,0.15)",
                  color: movie.is_active ? "#4caf50" : "#e50914"
                }}>
                  {movie.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td style={td}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleOpenEdit(movie)} className="admin-btn-secondary">
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteMovie(movie.id)} className="admin-btn-danger">
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* FORM MODAL */}
      {modalOpen && (
        <div style={modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #333", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, color: "#fff" }}>{editingMovie ? "✏️ Edit Movie" : "🎬 Add Movie"}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", color: "#aaa", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "75vh", overflowY: "auto", paddingRight: "8px" }}>
              <div style={formGroup}>
                <label style={label}>Movie Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter movie title"
                  style={input}
                  required
                />
              </div>

              <div style={formGroup}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={label}>Description</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={generatingDesc}
                    style={{
                      background: "rgba(122, 162, 255, 0.1)",
                      color: "#7aa2ff",
                      border: "1px solid rgba(122, 162, 255, 0.3)",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: generatingDesc ? "not-allowed" : "pointer",
                    }}
                  >
                    {generatingDesc ? "✨ Generating..." : "✨ Generate with AI"}
                  </button>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter movie synopsis..."
                  style={{ ...input, height: "80px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={formGroup}>
                  <label style={label}>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 120"
                    style={input}
                    required
                  />
                </div>
                <div style={formGroup}>
                  <label style={label}>Release Date *</label>
                  <input
                    type="date"
                    value={form.release_date}
                    onChange={(e) => setForm({ ...form, release_date: e.target.value })}
                    style={input}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={formGroup}>
                  <label style={label}>Language *</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    placeholder="e.g. English"
                    style={input}
                    required
                  />
                </div>
                <div style={formGroup}>
                  <label style={label}>Rating (0.0 to 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    style={input}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={formGroup}>
                  <label style={label}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={input}
                  >
                    <option value="in_theatres">In Theatres</option>
                    <option value="ott">OTT</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
                <div style={formGroup}>
                  <label style={label}>Trailer URL</label>
                  <input
                    type="url"
                    value={form.trailer_url}
                    onChange={(e) => setForm({ ...form, trailer_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    style={input}
                  />
                </div>
              </div>

              <div style={formGroup}>
                <label style={label}>
                  🎬 OTT Watch Link {form.category === "ott" && "*"}
                </label>
                <input
                  type="url"
                  value={form.platform_url}
                  onChange={(e) => setForm({ ...form, platform_url: e.target.value })}
                  placeholder="https://netflix.com/watch/... or Prime/YouTube link"
                  style={input}
                />
                {form.category === "ott" && !form.platform_url && (
                  <span style={{ color: "#f5a623", fontSize: "11px" }}>
                    ⚠️ Required so users can click "Watch Online" for this OTT movie
                  </span>
                )}
              </div>

              <div style={formGroup}>
                <label style={label}>Genres</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", background: "#111122", padding: "10px", borderRadius: "8px", border: "1px solid #333" }}>
                  {genres.map((genre) => {
                    const isChecked = selectedGenres.includes(genre.id);
                    return (
                      <label key={genre.id} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ccc", cursor: "pointer", fontSize: "13px", background: isChecked ? "#e5091433" : "#222", padding: "4px 10px", borderRadius: "20px", border: isChecked ? "1px solid #e50914" : "1px solid #444", transition: "all 0.2s" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleGenreToggle(genre.id)}
                          style={{ display: "none" }}
                        />
                        {genre.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={formGroup}>
                  <label style={label}>Poster Image {editingMovie ? "" : "*"}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPosterFile(e.target.files[0])}
                    style={{ ...input, padding: "8px" }}
                  />
                </div>
                <div style={formGroup}>
                  <label style={label}>Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files[0])}
                    style={{ ...input, padding: "8px" }}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fff", cursor: "pointer", marginTop: "8px" }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active (Visible to users)
              </label>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#e50914",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: submitting ? "not-allowed" : "pointer",
                  marginTop: "16px",
                  fontSize: "15px",
                }}
              >
                {submitting ? "Saving Movie..." : "💾 Save Movie"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: "14px 16px", textAlign: "left", color: "#888", fontSize: "13px", fontWeight: "700" };
const td = { padding: "14px 16px", color: "#ccc", fontSize: "14px" };

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(4px)",
  zIndex: 1000,
};

const modalContent = {
  background: "#1a1a2e",
  padding: "30px",
  width: "600px",
  maxWidth: "90%",
  borderRadius: "16px",
  border: "1px solid #33334d",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const label = {
  color: "#aaa",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.5px",
};

const input = {
  background: "#121224",
  border: "1px solid #33334d",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
};