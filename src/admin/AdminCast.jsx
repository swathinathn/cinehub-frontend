import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminCast() {
  const [cast, setCast] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", role: "actor", character_name: "", movie: "", photo: null });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    fetchCast();
  }, [currentPage]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchCast = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/movies/cast/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setCast(res.data.results || res.data);
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

  const fetchMovies = async () => {
    try {
      const res = await API.get("/movies/list/?page_size=1000");
      setMovies(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.movie) return;
    try {
      const formData = new FormData();
      formData.append("movie", form.movie);
      formData.append("name", form.name);
      formData.append("role", form.role);

      // Send character_name only for actors
      if (form.role === "actor") {
        formData.append("character_name", form.character_name);
      } else {
        formData.append("character_name", ""); // Clear for non-actors
      }

      if (form.photo) {
        formData.append("photo", form.photo);
      }

      await API.post("/movies/cast/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm({ name: "", role: "actor", character_name: "", movie: "", photo: null });
      fetchCast();
    } catch (err) {
      console.error(err);
      alert("Failed to add cast member");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cast/crew member?")) return;
    try {
      await API.delete(`/movies/cast/${id}/`);
      fetchCast();
    } catch (err) {
      alert("Failed to delete cast member");
    }
  };

  if (loading) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-header">Manage Cast & Crew</h1>

      <div className="admin-card">
        <h3 className="admin-card-title">Add New Cast/Crew</h3>
        <form onSubmit={handleAdd} className="admin-form-group">
          <select
            value={form.movie}
            onChange={(e) => setForm({ ...form, movie: e.target.value })}
            className="admin-select"
          >
            <option value="">Select Movie...</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <input
            type="text"
            placeholder="Name (e.g. Robert Downey Jr.)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="admin-input"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="admin-select"
          >
            <option value="actor">Actor</option>
            <option value="director">Director</option>
            <option value="producer">Producer</option>
            <option value="writer">Writer</option>
          </select>
          {form.role === "actor" && (
            <input
              type="text"
              placeholder="Character Name"
              value={form.character_name}
              onChange={(e) => setForm({ ...form, character_name: e.target.value })}
              className="admin-input"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
            className="admin-input"
          />
          <button type="submit" className="admin-btn-primary">
            Add Cast
          </button>
        </form>
      </div>

      <div className="admin-grid">
        {cast.map(c => (
          <div key={c.id} className="admin-list-item">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {c.photo && <img src={c.photo} alt={c.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />}
              <div>
                <span style={{ color: "#fff", fontWeight: "bold", display: "block" }}>{c.name} ({c.role})</span>
                {c.character_name && <span style={{ color: "#888", fontSize: "12px" }}>as {c.character_name}</span>}
                <span style={{ color: "#888", fontSize: "12px", display: "block", marginTop: "4px" }}>Movie ID: {c.movie}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} className="admin-btn-danger">
              Delete
            </button>
          </div>
        ))}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
