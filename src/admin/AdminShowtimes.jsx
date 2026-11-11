import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);

  // Form State
  const [form, setForm] = useState({
    movie_id: "",
    theatre_id: "",
    screen_id: "",
    show_date: "",
    show_time: "",
    ticket_price: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShowtimes();
  }, [currentPage]);

  useEffect(() => {
    fetchFormDependencies();
  }, []);

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/movies/showtimes/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setShowtimes(res.data.results || res.data);
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

  const fetchFormDependencies = async () => {
    try {
      const [moviesRes, theatresRes, screensRes] = await Promise.all([
        API.get("/movies/list/?page_size=1000"),
        API.get("/movies/theatres/?page_size=1000"),
        API.get("/movies/screens/?page_size=1000"),
      ]);
      setMovies(moviesRes.data.results || moviesRes.data);
      setTheatres(theatresRes.data.results || theatresRes.data);
      setScreens(screensRes.data.results || screensRes.data);
    } catch (err) {
      console.error("Failed to load list dependencies", err);
    }
  };

  const deleteShowtime = async (id) => {
    if (!window.confirm("Delete this showtime? This will also cancel related bookings!")) return;
    try {
      await API.delete(`/movies/showtimes/${id}/`);
      fetchShowtimes();
    } catch (err) {
      alert("Failed to delete showtime.");
    }
  };

  const handleOpenAdd = () => {
    setEditingShowtime(null);
    setForm({
      movie_id: "", theatre_id: "", screen_id: "", show_date: "", show_time: "", ticket_price: "", is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (showtime) => {
    setEditingShowtime(showtime);
    setForm({
      movie_id: showtime.movie_id || showtime.movie?.id || "",
      theatre_id: showtime.screen?.theatre?.id || showtime.screen?.theatre || "",
      screen_id: showtime.screen_id || showtime.screen?.id || "",
      show_date: showtime.show_date,
      show_time: showtime.show_time.slice(0, 5),
      ticket_price: showtime.ticket_price,
      is_active: showtime.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Validate
    if (!form.movie_id || !form.screen_id || !form.show_date || !form.show_time || !form.ticket_price) {
      alert("Please fill all required fields");
      setSubmitting(false);
      return;
    }

    try {
      if (editingShowtime) {
        await API.patch(`/movies/showtimes/${editingShowtime.id}/`, form);
      } else {
        await API.post("/movies/showtimes/", form);
      }
      setModalOpen(false);
      fetchShowtimes();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.non_field_errors?.[0] || "Failed to save showtime. Check for overlapping times.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredScreens = screens.filter(s => s.theatre?.toString() === form.theatre_id?.toString() || s.theatre?.id?.toString() === form.theatre_id?.toString());

  if (loading) return <p className="admin-page">Loading...</p>;

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 className="admin-header" style={{ margin: 0 }}>🕒 Showtime Management</h2>
        <button onClick={handleOpenAdd} className="admin-btn-primary">
          ➕ Add New Showtime
        </button>
      </div>

      <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", background: "#0e0e1a", borderRadius: "12px", overflow: "hidden" }}>
        <thead>
          <tr style={{ background: "#16213e", color: "#fff" }}>
            <th style={th}>Movie</th>
            <th style={th}>Theatre (Screen)</th>
            <th style={th}>Date & Time</th>
            <th style={th}>Price</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {showtimes.map((st) => (
            <tr key={st.id} style={{ borderBottom: "1px solid #222" }}>
              <td style={{ ...td, color: "#fff", fontWeight: "600" }}>{st.movie?.title}</td>
              <td style={td}>{st.screen?.theatre?.name} ({st.screen?.name})</td>
              <td style={td}>{st.show_date} at {st.show_time.slice(0, 5)}</td>
              <td style={td}>₹{st.ticket_price}</td>
              <td style={td}>
                <span style={{
                  padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
                  background: st.is_active ? "rgba(76,175,80,0.15)" : "rgba(229,9,20,0.15)",
                  color: st.is_active ? "#4caf50" : "#e50914"
                }}>
                  {st.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td style={td}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleOpenEdit(st)} className="admin-btn-secondary">
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteShowtime(st.id)} className="admin-btn-danger">
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

      {/* MODAL */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#09090f", border: "1px solid #333", borderRadius: "16px",
            padding: "30px", width: "100%", maxWidth: "500px", position: "relative"
          }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "18px" }}
            >
              ✕
            </button>
            <h2 style={{ color: "#fff", marginTop: 0, marginBottom: "20px" }}>
              {editingShowtime ? "Edit Showtime" : "Add New Showtime"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Select Movie *</label>
                <select 
                  value={form.movie_id} 
                  onChange={(e) => setForm({ ...form, movie_id: e.target.value })} 
                  className="admin-select"
                  required
                >
                  <option value="">-- Choose Movie --</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Select Theatre *</label>
                <select 
                  value={form.theatre_id} 
                  onChange={(e) => setForm({ ...form, theatre_id: e.target.value, screen_id: "" })} 
                  className="admin-select"
                  required
                >
                  <option value="">-- Choose Theatre --</option>
                  {theatres.map(t => <option key={t.id} value={t.id}>{t.name} ({t.city})</option>)}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Select Screen *</label>
                <select 
                  value={form.screen_id} 
                  onChange={(e) => setForm({ ...form, screen_id: e.target.value })} 
                  className="admin-select"
                  required
                  disabled={!form.theatre_id}
                >
                  <option value="">-- Choose Screen --</option>
                  {filteredScreens.map(s => <option key={s.id} value={s.id}>{s.name} ({s.total_seats} seats)</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Date *</label>
                  <input 
                    type="date" 
                    value={form.show_date} 
                    onChange={(e) => setForm({ ...form, show_date: e.target.value })} 
                    className="admin-input"
                    required
                  />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Time *</label>
                  <input 
                    type="time" 
                    value={form.show_time} 
                    onChange={(e) => setForm({ ...form, show_time: e.target.value })} 
                    className="admin-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Ticket Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={form.ticket_price} 
                    onChange={(e) => setForm({ ...form, ticket_price: e.target.value })} 
                    className="admin-input"
                    required
                  />
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", paddingBottom: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ccc", fontSize: "14px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={form.is_active} 
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })} 
                      style={{ width: "18px", height: "18px" }}
                    />
                    Is Active?
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="admin-btn-primary"
                style={{ marginTop: "10px", padding: "14px" }}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Showtime"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: "14px 16px", textAlign: "left", color: "#aaa", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };
const td = { padding: "14px 16px", color: "#ccc", fontSize: "14px" };
const labelStyle = { color: "#888", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };