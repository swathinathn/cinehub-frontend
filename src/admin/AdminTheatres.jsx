import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminTheatres() {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", location: "", city: "" });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    fetchTheatres();
  }, [currentPage]);

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/movies/theatres/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setTheatres(res.data.results || res.data);
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

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.city) return;
    try {
      await API.post("/movies/theatres/", form);
      setForm({ name: "", location: "", city: "" });
      fetchTheatres();
    } catch (err) {
      alert("Failed to add theatre");
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm("Are you sure you want to delete this theatre? This will delete all its screens and showtimes!")) return;
    try {
      await API.delete(`/movies/theatres/${id}/`);
      fetchTheatres();
    } catch (err) {
      alert("Failed to delete theatre");
    }
  };

  const handleAddScreen = async (theatreId) => {
    const name = window.prompt("Enter screen name (e.g., Screen 1):");
    if (!name) return;
    const total_seats = window.prompt("Enter total seats (e.g., 100):");
    if (!total_seats) return;

    try {
      await API.post("/movies/screens/", { theatre: theatreId, name, total_seats: parseInt(total_seats) });
      fetchTheatres(); 
      alert("Screen added!");
    } catch (err) {
      alert("Failed to add screen");
    }
  };

  if (loading) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-header">Manage Theatres & Screens</h1>
      
      <div className="admin-card">
        <h3 className="admin-card-title">Add New Theatre</h3>
        <form onSubmit={handleAddTheatre} className="admin-form-group">
          <input 
            type="text" 
            placeholder="Theatre Name" 
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="admin-input"
          />
          <input 
            type="text" 
            placeholder="Location" 
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="admin-input"
          />
          <input 
            type="text" 
            placeholder="City" 
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="admin-input"
          />
          <button type="submit" className="admin-btn-primary">
            Add Theatre
          </button>
        </form>
      </div>

      <div className="admin-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {theatres.map(t => (
          <div key={t.id} className="admin-list-item">
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "#fff" }}>{t.name}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>{t.location}, {t.city}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleAddScreen(t.id)} className="admin-btn-secondary">
                + Add Screen
              </button>
              <button onClick={() => handleDeleteTheatre(t.id)} className="admin-btn-danger">
                Delete Theatre
              </button>
            </div>
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
