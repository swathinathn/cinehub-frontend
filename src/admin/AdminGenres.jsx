import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "" });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    fetchGenres();
  }, [currentPage]);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/movies/genres/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setGenres(res.data.results || res.data);
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await API.post("/movies/genres/", form);
      setForm({ name: "" });
      fetchGenres();
    } catch (err) {
      alert("Failed to add genre");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this genre?")) return;
    try {
      await API.delete(`/movies/genres/${id}/`);
      fetchGenres();
    } catch (err) {
      alert("Failed to delete genre");
    }
  };

  if (loading) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-header">Manage Genres</h1>

      <div className="admin-card">
        <h3 className="admin-card-title">Add New Genre</h3>
        <form onSubmit={handleAdd} className="admin-form-group">
          <input
            type="text"
            placeholder="Genre Name"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            className="admin-input"
          />
          <button type="submit" className="admin-btn-primary">
            Add Genre
          </button>
        </form>
      </div>

      <div className="admin-grid">
        {genres.map(g => (
          <div key={g.id} className="admin-list-item">
            <span style={{ color: "#fff", fontWeight: "bold" }}>{g.name}</span>
            <button onClick={() => handleDelete(g.id)} className="admin-btn-danger">
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
