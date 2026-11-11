import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import API from "../utils/axios";
import "./seatLayout.css";
import FoodOrder from "../components/FoodOrder";
import Theatre3D from "../components/Theatre3D";

const MAX_SEATS = 10;
const rows = ["A", "B", "C", "D", "E"];
const balconyRows = ["F", "G"];
const allRows = [...rows, ...balconyRows];
const seatsPerRow = 12;

const seatCategories = [
  { name: "Recliner", priceMod: 100, rows: ["E"] },
  { name: "Premium", priceMod: 50, rows: ["C", "D"] },
  { name: "Standard", priceMod: 0, rows: ["A", "B"] },
  { name: "Balcony", priceMod: 70, rows: ["F", "G"] },
];

const getTier = (row) => seatCategories.find((c) => c.rows.includes(row));

export default function SeatLayout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("cinehub-user"));

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [foodOrders, setFoodOrders] = useState([]);
  const [seatError, setSeatError] = useState("");
  const [view3d, setView3d] = useState(true);

  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      value: d.toISOString().split("T")[0],
      month: d.toLocaleDateString("en-US", { month: "short" }),
      full: d,
    };
  });

  useEffect(() => {
    if (!user) {
      window.dispatchEvent(new Event("open-login"));
      navigate("/");
    }
  }, []);

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

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!selectedShowtime) {
        setBookedSeats([]);
        return;
      }
      try {
        const res = await API.get(`/movies/showtimes/${selectedShowtime.id}/booked-seats/`);
        setBookedSeats(res.data.booked_seats || []);
      } catch (err) {
        console.error("Failed to load booked seats", err);
      }
    };
    fetchBookedSeats();
  }, [selectedShowtime]);

  if (!user) return null;

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
    if (bookedSeats.includes(seat)) return;

    setSeatError("");
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      if (prev.length >= MAX_SEATS) {
        setSeatError(`You can only select up to ${MAX_SEATS} seats per booking.`);
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleBookingSuccess = async (paymentDetails) => {
    try {
      await API.post("/bookings/", {
        showtime_id: selectedShowtime.id,
        seats: selectedSeats,
        food_orders: foodOrders,
        razorpay_order_id: paymentDetails?.razorpay_order_id,
        razorpay_payment_id: paymentDetails?.razorpay_payment_id,
      });
      setShowPayment(false);
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed", err);
      const seatErrorMsg = err.response?.data?.seats;
      if (seatErrorMsg) {
        setSeatError(Array.isArray(seatErrorMsg) ? seatErrorMsg[0] : seatErrorMsg);
        setShowPayment(false);
        const res = await API.get(`/movies/showtimes/${selectedShowtime.id}/booked-seats/`);
        setBookedSeats(res.data.booked_seats || []);
        setSelectedSeats([]);
      } else {
        alert("Booking failed. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="seat-page">
        <div className="seat-loading">
          <span className="seat-loading-dot" />
          Opening CineHub Premiere Hall…
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="seat-page">
        <div className="seat-loading">Movie not found.</div>
      </div>
    );
  }

  const basePrice = parseFloat(selectedShowtime?.ticket_price) || 0;
  const foodTotal = foodOrders.reduce((sum, f) => sum + parseFloat(f.price) * f.qty, 0);

  const ticketTotal = selectedSeats.reduce((total, seat) => {
    const tier = getTier(seat.charAt(0));
    return total + basePrice + (tier ? tier.priceMod : 0);
  }, 0);

  const grandTotal = ticketTotal + foodTotal;
  const poster = movie.poster_url || movie.poster || movie.image || "";
  const canPay = selectedDate && selectedTheatre && selectedShowtime && selectedSeats.length;
  const step = selectedSeats.length
    ? 4
    : selectedShowtime
      ? 3
      : selectedTheatre
        ? 2
        : selectedDate
          ? 1
          : 0;

  const renderSeatGrid = (sectionRows, title) => (
    <div className="seat-section">
      <div className="seat-section-title">{title}</div>
      {sectionRows.map((row) => {
        const tier = getTier(row);
        const mid = Math.floor(seatsPerRow / 2);
        return (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            {Array.from({ length: seatsPerRow }).map((_, i) => {
              const seat = `${row}${i + 1}`;
              const isBooked = bookedSeats.includes(seat);
              const aisle = i === mid;
              return (
                <React.Fragment key={seat}>
                  {aisle && <span className="seat-aisle" />}
                  <button
                    type="button"
                    className={`seat seat-${(tier?.name || "standard").toLowerCase()} ${selectedSeats.includes(seat) ? "selected" : ""
                      } ${isBooked ? "booked" : ""}`}
                    disabled={!selectedTheatre || !selectedShowtime || isBooked}
                    onClick={() => toggleSeat(seat)}
                    title={isBooked ? "Already booked" : `${seat} • ${tier?.name}`}
                  >
                    {i + 1}
                  </button>
                </React.Fragment>
              );
            })}
            <span className={`tier-tag tier-${(tier?.name || "standard").toLowerCase()}`}>
              {tier?.name}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="seat-page">
      <header className="seat-hero">
        {poster ? <img src={poster} alt={movie.title} className="seat-hero-poster" /> : <div className="seat-hero-poster seat-hero-poster-fallback">CH</div>}
        <div className="seat-hero-copy">
          <p className="seat-kicker">CineHub Premiere Hall</p>
          <h2>{movie.title}</h2>
          <div className="seat-meta">
            {movie.certificate && (
              <span>
                {typeof movie.certificate === "object"
                  ? movie.certificate.name
                  : movie.certificate}
              </span>
            )}
            {movie.language && (
              <span>
                {typeof movie.language === "object"
                  ? movie.language.name
                  : movie.language}
              </span>
            )}
            {Array.isArray(movie.genre) && movie.genre.length > 0 && (
              <span>{movie.genre.map((g) => g.name || g).join(", ")}</span>
            )}
            {movie.duration && <span>{movie.duration} min</span>}
            <span>Orchestra + Balcony</span>
          </div>
        </div>
      </header>

      <ol className="seat-steps">
        {[
          { n: 1, label: "Date" },
          { n: 2, label: "Theatre" },
          { n: 3, label: "Time" },
          { n: 4, label: "Seats" },
        ].map((item) => (
          <li key={item.n} className={step >= item.n ? "done" : ""}>
            <i>{item.n}</i>
            {item.label}
          </li>
        ))}
      </ol>

      <section className="seat-panel">
        <h4>Select date</h4>
        <div className="date-list">
          {dates.map((d) => (
            <button
              type="button"
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
              <em>{d.month}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="seat-panel">
        <h4>Select theatre</h4>
        {uniqueTheatres.length === 0 ? (
          <p className="seat-empty">Pick a date to see CineHub theatres.</p>
        ) : (
          <div className="theatre-list">
            {uniqueTheatres.map((theatre) => (
              <button
                type="button"
                key={theatre.name}
                className={`theatre-card ${selectedTheatre?.name === theatre.name ? "active" : ""}`}
                onClick={() => {
                  setSelectedTheatre(theatre);
                  setSelectedShowtime(null);
                  setSelectedSeats([]);
                }}
              >
                <h5>{theatre.name}</h5>
                <p>{theatre.location || "CineHub Premiere"}</p>
                <span className="status">Available</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedTheatre && (
        <section className="seat-panel">
          <h4>Select show time</h4>
          <div className="time-buttons">
            {timesForTheatre.map((showtime) => {
              const showDateObj = new Date(`${showtime.show_date}T${showtime.show_time}`);
              const hasPassed = showDateObj < new Date();
              return (
                <button
                  type="button"
                  key={showtime.id}
                  className={`time-btn ${selectedShowtime?.id === showtime.id ? "active" : ""}`}
                  disabled={hasPassed}
                  onClick={() => {
                    setSelectedShowtime(showtime);
                    setSelectedSeats([]);
                  }}
                  title={hasPassed ? "Showtime passed" : ""}
                >
                  <b>{showtime.show_time?.slice(0, 5)}</b>
                  <small>₹{showtime.ticket_price}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="view-toggle">
        <button type="button" className={view3d ? "active" : ""} onClick={() => setView3d(true)}>
          3D Premiere Hall
        </button>
        <button type="button" className={!view3d ? "active" : ""} onClick={() => setView3d(false)}>
          Classic seat map
        </button>
      </div>

      {view3d ? (
        <Theatre3D
          rows={rows}
          balconyRows={balconyRows}
          seatsPerRow={seatsPerRow}
          bookedSeats={bookedSeats}
          selectedSeats={selectedSeats}
          selectedMovie={movie}
          disabled={!selectedTheatre || !selectedShowtime}
          onToggleSeat={toggleSeat}
          getTier={getTier}
          getSeatPrice={(seat) => basePrice + (getTier(seat.charAt(0))?.priceMod || 0)}
        />
      ) : (
        <div className="seat-3d-stage">
          <div className="screen">CINEHUB SCREEN</div>
          <div className="seats-container">
            {renderSeatGrid(rows, "Orchestra")}
            {renderSeatGrid(balconyRows, "Balcony lounge")}
          </div>
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-box available" />
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-box selected" />
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-box booked" />
              <span>Booked</span>
            </div>
          </div>
        </div>
      )}

      {selectedShowtime && (
        <div className="tier-prices">
          {seatCategories.map((c) => (
            <div key={c.name} className={`tier-price-item tier-chip-${c.name.toLowerCase()}`}>
              <span>{c.name}</span>
              <strong>₹{(basePrice + c.priceMod).toFixed(0)}</strong>
            </div>
          ))}
        </div>
      )}

      {seatError && <div className="seat-error">⚠ {seatError}</div>}

      {selectedShowtime && <FoodOrder onFoodSelect={setFoodOrders} />}

      <aside className="booking-summary">
        <p className="booking-summary-title">Your booking</p>
        <p><strong>Date</strong> <span>{selectedDate || "Not selected"}</span></p>
        <p><strong>Theatre</strong> <span>{selectedTheatre?.name || "Not selected"}</span></p>
        <p><strong>Time</strong> <span>{selectedShowtime?.show_time?.slice(0, 5) || "Not selected"}</span></p>
        <p><strong>Seats</strong> <span>{selectedSeats.join(", ") || "None"}</span></p>
        <p><strong>Tickets</strong> <span>₹{ticketTotal.toFixed(2)}</span></p>
        {foodTotal > 0 && (
          <p><strong>Food & drinks</strong> <span>₹{foodTotal.toFixed(2)}</span></p>
        )}
        <p className="booking-total">
          <strong>Total</strong>
          <span>₹{grandTotal.toFixed(2)}</span>
        </p>
        <button
          type="button"
          className="confirm-btn"
          disabled={!canPay}
          onClick={() => setShowPayment(true)}
        >
          Proceed to payment
        </button>
      </aside>

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