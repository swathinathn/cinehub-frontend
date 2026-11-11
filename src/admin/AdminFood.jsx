import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminFood() {
  const [food, setFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "snacks", image: null });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    fetchFood();
  }, [currentPage]);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/movies/food/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setFood(res.data.results || res.data);
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
    if (!form.name || !form.price) return;
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      if (form.image) {
        formData.append("image", form.image);
      }

      await API.post("/movies/food/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm({ name: "", description: "", price: "", category: "snacks", image: null });
      fetchFood();
    } catch (err) {
      alert("Failed to add food item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      await API.delete(`/movies/food/${id}/`);
      fetchFood();
    } catch (err) {
      alert("Failed to delete food item");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await API.patch(`/movies/food/${item.id}/`, { is_available: !item.is_available });
      fetchFood();
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  if (loading) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-header">Manage Food & Concessions</h1>

      <div className="admin-card">
        <h3 className="admin-card-title">Add New Food Item</h3>
        <form onSubmit={handleAdd} className="admin-form-group">
          <input
            type="text"
            placeholder="Name (e.g. Large Popcorn)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="admin-input"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="admin-input"
          />
          <input
            type="number"
            placeholder="Price"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="admin-input"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="admin-select"
          >
            <option value="snacks">Snacks</option>
            <option value="drinks">Drinks</option>
            <option value="combos">Combos</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            className="admin-input"
          />
          <button type="submit" className="admin-btn-primary">
            Add Food
          </button>
        </form>
      </div>

      <div className="admin-grid">
        {food.map(f => (
          <div key={f.id} className="admin-list-item">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {f.image && <img src={f.image} alt={f.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />}
              <div>
                <span style={{ color: "#fff", fontWeight: "bold", display: "block" }}>{f.name} <span style={{ color: "#e50914" }}>₹{f.price}</span></span>
                <span style={{ color: "#888", fontSize: "12px", display: "block" }}>{f.category.toUpperCase()} - {f.description}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <label style={{ color: "#fff", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                <input type="checkbox" checked={f.is_available} onChange={() => toggleAvailability(f)} />
                Available
              </label>
              <button onClick={() => handleDelete(f.id)} className="admin-btn-danger">
                Delete
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
