import React, { useState, useEffect } from "react";
import API from "../utils/axios";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/bookings/?page_size=1000");
        setBookings(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/bookings/${id}/`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>🎟️ Booking Management</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#16213e", color: "#fff" }}>
            <th style={th}>User</th>
            <th style={th}>Movie</th>
            <th style={th}>Date</th>
            <th style={th}>Seats</th>
            <th style={th}>Amount</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} style={{ borderBottom: "1px solid #333" }}>
              <td style={td}>{booking.user}</td>
              <td style={{ ...td, color: "#fff" }}>{booking.showtime?.movie?.title}</td>
              <td style={td}>{booking.showtime?.show_date}</td>
              <td style={td}>{booking.seats?.join(", ")}</td>
              <td style={td}>₹{booking.total_amount}</td>
              <td style={td}>
                <span style={{
                  padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                  background: booking.status === "confirmed" ? "#4caf50" : booking.status === "cancelled" ? "#e50914" : "#f5a623",
                  color: "#fff"
                }}>
                  {booking.status?.toUpperCase()}
                </span>
              </td>
              <td style={td}>
                <select
                  value={booking.status}
                  onChange={(e) => updateStatus(booking.id, e.target.value)}
                  style={{ background: "#16213e", color: "#fff", border: "1px solid #333", padding: "4px", borderRadius: "6px" }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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