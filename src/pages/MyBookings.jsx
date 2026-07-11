import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import "./myBookings.css";

export default function MyBookings() {
  const user = JSON.parse(localStorage.getItem("cinehub-user"));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await API.get("/bookings/");
        setBookings(response.data.results || response.data);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
    else setLoading(false);
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await API.patch(`/bookings/${bookingId}/`, { status: "cancelled" });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  const downloadTicket = async (bookingId) => {
    try {
      const response = await API.get(`/bookings/${bookingId}/download-ticket/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ticket_CH${String(bookingId).padStart(5, "0")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download ticket.");
    }
  };

  if (!user) {
    return (
      <div className="bookings-page empty">
        <h2>Please login to view your bookings</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bookings-page empty">
        <h2>Loading bookings...</h2>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bookings-page empty">
        <h2>No Bookings Yet 🎟️</h2>
        <p>Your booked tickets will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <h2>🎟️ My Bookings</h2>

      {bookings.map((booking) => {
        const movie = booking.showtime?.movie;
        const posterUrl = movie?.poster?.startsWith("http")
          ? movie.poster
          : `http://127.0.0.1:8000${movie?.poster}`;

        return (
          <div className="booking-ticket" key={booking.id}>
            {movie && (
              <img
                src={posterUrl}
                alt={movie.title}
                className="ticket-poster"
                onError={(e) => { e.target.src = "/placeholder.jpg"; }}
              />
            )}

            <div className="ticket-info">
              <h3>{movie?.title || "Movie"}</h3>

              <p><strong>Theatre:</strong> {booking.showtime?.screen?.theatre?.name}</p>
              <p><strong>Date:</strong> {booking.showtime?.show_date}</p>
              <p><strong>Show Time:</strong> {booking.showtime?.show_time?.slice(0, 5)}</p>
              <p><strong>Seats:</strong> {booking.seats?.join(", ")}</p>
              <p className="total">
                <strong>Total Paid:</strong> ₹{booking.total_amount}
              </p>

              <span className={`status ${booking.status}`}>
                {booking.status?.toUpperCase()}
              </span>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                {booking.status !== "cancelled" && (
                  <button
                    className="cancel-btn"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    ❌ Cancel Booking
                  </button>
                )}

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => downloadTicket(booking.id)}
                    style={{
                      background: "#1a1a2e",
                      color: "#fff",
                      border: "1px solid #444",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    📄 Download Ticket
                  </button>
                )}
              </div>
            </div>

            <div className="qr-box">QR</div>
          </div>
        );
      })}
    </div>
  );
}