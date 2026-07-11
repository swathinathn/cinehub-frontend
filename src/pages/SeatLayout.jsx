import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import API from "../utils/axios";
import "./seatLayout.css";
import FoodOrder from "../components/FoodOrder";

export default function SeatLayout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("cinehub-user"));

  useEffect(() => {
    if (!user) {
      window.dispatchEvent(new Event("open-login"));
      navigate("/");
    }
  }, []);

  if (!user) return null;

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [foodOrders, setFoodOrders] = useState([]);

  const rows = ["A", "B", "C", "D", "E"];
  const seatsPerRow = 12;

  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      value: d.toISOString().split("T")[0],
      full: d
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const movieRes = await API.get(`/movies/list/${id}/`);
        setMovie(movieRes.data);

        const showtimeRes = await API.get(`/movies/showtimes/?movie=${id}`);
        setShowtimes(showtimeRes.data.results || showtimeRes.data);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredShowtimes = showtimes.filter(
    (s) => !selectedDate || s.show_date === selectedDate
  );

  const uniqueTheatres = filteredShowtimes.reduce((acc, s) => {
    const theatreName = s.screen?.theatre?.name;
    if (theatreName && !acc.find((t) => t.name === theatreName)) {
      acc.push({ name: theatreName, location: s.screen?.theatre?.location });
    }
    return acc;
  }, []);

  const timesForTheatre = filteredShowtimes.filter(
    (s) => s.screen?.theatre?.name === selectedTheatre?.name
  );

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleBookingSuccess = async () => {
    try {
      await API.post("/bookings/", {
        showtime_id: selectedShowtime.id,
        seats: selectedSeats,
        food_orders: foodOrders,
      });
      setShowPayment(false);
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed", err);
      alert("Booking failed. Please try again.");
    }
  };

  if (loading) return <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>Loading...</div>;
  if (!movie) return <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>Movie not found.</div>;

  const ticketPrice = selectedShowtime?.ticket_price || 0;
  const foodTotal = foodOrders.reduce((sum, f) => sum + (parseFloat(f.price) * f.qty), 0);
  const ticketTotal = selectedSeats.length * ticketPrice;
  const grandTotal = ticketTotal + foodTotal;

  return (
    <div className="seat-page">
      <h2>{movie.title}</h2>

      {/* DATE SELECTOR */}
      <div className="date-selector">
        <h4>Select Date</h4>
        <div className="date-list">
          {dates.map((d) => (
            <div
              key={d.value}
              className={`date-card ${selectedDate === d.value ? "active" : ""}`}
              onClick={() => {
                setSelectedDate(d.value);
                setSelectedTheatre(null);
                setSelectedShowtime(null);
                setSelectedSeats([]);
              }}
            >
              <span>{d.label}</span>
              <strong>{d.full.getDate()}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* THEATRES */}
      <div className="theatre-selector">
        <h4>Select Theatre</h4>
        {uniqueTheatres.length === 0 ? (
          <p style={{ color: "#aaa" }}>No shows available for this date.</p>
        ) : (
          <div className="theatre-list">
            {uniqueTheatres.map((theatre) => (
              <div
                key={theatre.name}
                className={`theatre-card ${selectedTheatre?.name === theatre.name ? "active" : ""}`}
                onClick={() => {
                  setSelectedTheatre(theatre);
                  setSelectedShowtime(null);
                  setSelectedSeats([]);
                }}
              >
                <h5>{theatre.name}</h5>
                <p>{theatre.location}</p>
                <span className="status">Available</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TIMES */}
      {selectedTheatre && (
        <div className="time-selector">
          <h4>Select Show Time</h4>
          <div className="time-buttons">
            {timesForTheatre.map((showtime) => (
              <button
                key={showtime.id}
                className={`time-btn ${selectedShowtime?.id === showtime.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedShowtime(showtime);
                  setSelectedSeats([]);
                }}
              >
                {showtime.show_time?.slice(0, 5)} • ₹{showtime.ticket_price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN */}
      <div className="screen">SCREEN</div>

      {/* LEGEND */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box" style={{ background: "#1c1c2b", border: "1px solid #2a2a3d" }}></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: "linear-gradient(135deg, #f84464, #c0392b)" }}></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: "#111", opacity: 0.4 }}></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* SEATS */}
      <div className="seats-container">
        {rows.map((row) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            {Array.from({ length: seatsPerRow }).map((_, i) => {
              const seat = `${row}${i + 1}`;
              return (
                <button
                  key={seat}
                  className={`seat ${selectedSeats.includes(seat) ? "selected" : ""}`}
                  disabled={!selectedTheatre || !selectedShowtime}
                  onClick={() => toggleSeat(seat)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* FOOD ORDER */}
      {selectedShowtime && (
        <FoodOrder onFoodSelect={setFoodOrders} />
      )}

      {/* SUMMARY */}
      <div className="booking-summary">
        <p><strong>Date</strong> <span>{selectedDate || "Not selected"}</span></p>
        <p><strong>Theatre</strong> <span>{selectedTheatre?.name || "Not selected"}</span></p>
        <p><strong>Time</strong> <span>{selectedShowtime?.show_time?.slice(0, 5) || "Not selected"}</span></p>
        <p><strong>Seats</strong> <span>{selectedSeats.join(", ") || "None"}</span></p>
        <p><strong>Tickets</strong> <span>₹{ticketTotal}</span></p>
        {foodTotal > 0 && (
          <p><strong>Food & Drinks</strong> <span>₹{foodTotal.toFixed(2)}</span></p>
        )}
        <p><strong>Total</strong> <span style={{ color: "#f84464", fontSize: "18px" }}>₹{grandTotal.toFixed(2)}</span></p>

        <button
          className="confirm-btn"
          disabled={!selectedDate || !selectedTheatre || !selectedShowtime || !selectedSeats.length}
          onClick={() => setShowPayment(true)}
        >
          🎟️ Proceed to Payment
        </button>
      </div>

      {showPayment && (
        <PaymentModal
          movie={movie}
          seats={selectedSeats}
          total={grandTotal.toFixed(2)}
          theatre={selectedTheatre.name}
          time={selectedShowtime?.show_time?.slice(0, 5)}
          date={selectedDate}
          foodOrders={foodOrders}
          onClose={() => setShowPayment(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}