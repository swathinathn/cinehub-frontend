import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/bookings/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setBookings(res.data.results || res.data);
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

  if (loading) return <p className="admin-page">Loading...</p>;

  return (
    <div className="admin-page">
      <h2 className="admin-header">🎟️ Booking Management</h2>
      <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", background: "#0e0e1a", borderRadius: "12px", overflow: "hidden" }}>
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
            <tr key={booking.id} style={{ borderBottom: "1px solid #222" }}>
              <td style={td}>{booking.user}</td>
              <td style={{ ...td, color: "#fff", fontWeight: "600" }}>{booking.showtime?.movie?.title}</td>
              <td style={td}>{booking.showtime?.show_date}</td>
              <td style={td}>{booking.seats?.join(", ")}</td>
              <td style={td}>₹{booking.total_amount}</td>
              <td style={td}>
                <span style={{
                  padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
                  background: booking.status === "confirmed" ? "rgba(76,175,80,0.15)" : booking.status === "cancelled" ? "rgba(229,9,20,0.15)" : "rgba(245,166,35,0.15)",
                  color: booking.status === "confirmed" ? "#4caf50" : booking.status === "cancelled" ? "#e50914" : "#f5a623"
                }}>
                  {booking.status?.toUpperCase()}
                </span>
              </td>
              <td style={td}>
                <select
                  value={booking.status}
                  onChange={(e) => updateStatus(booking.id, e.target.value)}
                  className="admin-select"
                  style={{ width: "120px" }}
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

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

const th = { padding: "14px 16px", textAlign: "left", color: "#aaa", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };
const td = { padding: "14px 16px", color: "#ccc", fontSize: "14px" };