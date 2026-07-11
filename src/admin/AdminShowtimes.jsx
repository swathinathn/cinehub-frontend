import React, { useState, useEffect } from "react";
import API from "../utils/axios";

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const fetchShowtimes = async () => {
    try {
      const res = await API.get("/movies/showtimes/?page_size=1000");
      setShowtimes(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteShowtime = async (id) => {
    if (!window.confirm("Delete this showtime?")) return;
    try {
      await API.delete(`/movies/showtimes/${id}/`);
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete showtime.");
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>🕐 Showtime Management</h2>

      {showtimes.length === 0 ? (
        <p style={{ color: "#aaa" }}>No showtimes found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#16213e" }}>
              <th style={th}>Movie</th>
              <th style={th}>Theatre</th>
              <th style={th}>Screen</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Price</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((show) => (
              <tr key={show.id} style={{ borderBottom: "1px solid #333" }}>
                <td style={{ ...td, color: "#fff" }}>{show.movie?.title}</td>
                <td style={td}>{show.screen?.theatre?.name}</td>
                <td style={td}>{show.screen?.name}</td>
                <td style={td}>{show.show_date}</td>
                <td style={td}>{show.show_time?.slice(0, 5)}</td>
                <td style={td}>₹{show.ticket_price}</td>
                <td style={td}>
                  <span style={{
                    padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                    background: show.is_active ? "#4caf50" : "#e50914", color: "#fff"
                  }}>
                    {show.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={td}>
                  <button
                    onClick={() => deleteShowtime(show.id)}
                    style={{
                      background: "#e50914", color: "#fff", border: "none",
                      padding: "6px 12px", borderRadius: "6px", cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: "12px 16px", textAlign: "left", color: "#aaa" };
const td = { padding: "12px 16px", color: "#ccc" };