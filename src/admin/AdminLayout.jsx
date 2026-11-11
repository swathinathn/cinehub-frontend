import React from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("cinehub-user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f0f0f" }}>
      {/* SIDEBAR */}
      <div style={{
        width: "240px", background: "#1a1a2e", padding: "20px",
        display: "flex", flexDirection: "column", gap: "8px"
      }}>
        <h2 style={{ color: "#e50914", marginBottom: "30px" }}>🎬 CineHub Admin</h2>

        <Link to="/admin" style={linkStyle}>📊 Dashboard</Link>
        <Link to="/admin/movies" style={linkStyle}>🎬 Movies</Link>
        <Link to="/admin/bookings" style={linkStyle}>🎟️ Bookings</Link>
        <Link to="/admin/users" style={linkStyle}>👥 Users</Link>
        <Link to="/admin/showtimes" style={linkStyle}>🕐 Showtimes</Link>
        <Link to="/admin/theatres" style={linkStyle}>🏢 Theatres</Link>
        <Link to="/admin/genres" style={linkStyle}>🎭 Genres</Link>
        <Link to="/admin/cast" style={linkStyle}>🌟 Cast & Crew</Link>
        <Link to="/admin/food" style={linkStyle}>🍿 Food Items</Link>
        <button onClick={handleLogout} style={{
          marginTop: "auto", background: "#e50914", color: "#fff",
          border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer"
        }}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}

const linkStyle = {
  color: "#ccc", textDecoration: "none", padding: "10px 14px",
  borderRadius: "8px", background: "#16213e", display: "block"
};