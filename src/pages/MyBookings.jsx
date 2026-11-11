import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import API from "../utils/axios";
import "./myBookings.css";

export default function MyBookings() {
  // =====================================
  // USER
  // =====================================

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("cinehub-user"));
    } catch {
      return null;
    }
  };

  const user = getUser();

  // =====================================
  // STATES
  // =====================================

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  const [downloadingId, setDownloadingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all");

  const [searchParams, setSearchParams] = useSearchParams();

  const PAGE_SIZE = 5;

  const page = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10) || 1
  );

  // =====================================
  // FETCH BOOKINGS
  // =====================================

  useEffect(() => {
    let active = true;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/bookings/?page=${page}&page_size=${PAGE_SIZE}`
        );

        if (!active) return;

        const data = response.data;
        const bookingData = data.results || data;

        setBookings(bookingData);
        setCount(data.count ?? bookingData.length);
      } catch (err) {
        if (!active) return;

        console.error("Failed to load bookings", err);
        setError("Unable to load your bookings. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [page]);

  // =====================================
  // DATE HELPERS
  // =====================================

  const getShowDate = (booking) => {
    const date = booking.showtime?.show_date;
    const time = booking.showtime?.show_time;

    if (!date || !time) return null;

    const [year, month, day] = date.split("-").map(Number);

    const [hours, minutes, seconds = 0] = time
      .split(":")
      .map(Number);

    return new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":").map(Number);

    return new Date(
      2000,
      0,
      1,
      hours,
      minutes
    ).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const hasShowPassed = (booking) => {
    const showDate = getShowDate(booking);

    return showDate ? showDate <= new Date() : false;
  };

  // =====================================
  // DISPLAY STATUS
  // =====================================

  const getDisplayStatus = (booking) => {
    if (booking.status === "cancelled") {
      return "cancelled";
    }

    if (
      booking.status === "confirmed" &&
      hasShowPassed(booking)
    ) {
      return "finished";
    }

    return booking.status || "pending";
  };

  // =====================================
  // POSTER
  // =====================================

  const getPoster = (movie) => {
    if (!movie?.poster) {
      return "/placeholder.jpg";
    }

    if (movie.poster.startsWith("http")) {
      return movie.poster;
    }

    return `${BACKEND_URL}$${
      movie.poster.startsWith("/") ? "" : "/"
    }${movie.poster}`;
  };

  // =====================================
  // STATISTICS
  // =====================================

  const confirmed = bookings.filter(
    (b) =>
      b.status === "confirmed" &&
      !hasShowPassed(b)
  ).length;

  const cancelled = bookings.filter(
    (b) => b.status === "cancelled"
  ).length;

  const upcoming = bookings.filter(
    (b) => getDisplayStatus(b) === "confirmed"
  ).length;

  const finished = bookings.filter(
    (b) => getDisplayStatus(b) === "finished"
  ).length;

  // =====================================
  // FILTERS
  // =====================================

  const filters = [
    {
      id: "all",
      label: "All Bookings",
      count: bookings.length,
    },
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcoming,
    },
    {
      id: "finished",
      label: "Show Finished",
      count: finished,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: cancelled,
    },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const status = getDisplayStatus(booking);

    if (activeFilter === "all") return true;

    if (activeFilter === "upcoming") {
      return status === "confirmed";
    }

    if (activeFilter === "finished") {
      return status === "finished";
    }

    if (activeFilter === "cancelled") {
      return status === "cancelled";
    }

    return true;
  });

  // =====================================
  // PAGINATION
  // =====================================

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const goToPage = (num) => {
    setSearchParams({ page: String(num) });

    setActiveFilter("all");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================
  // CANCEL BOOKING
  // =====================================

  const cancelBooking = async (bookingId) => {
    const confirmedCancel = window.confirm(
      "Are you sure you want to cancel this movie booking?"
    );

    if (!confirmedCancel) return;

    try {
      setCancellingId(bookingId);

      await API.patch(`/bookings/${bookingId}/`, {
        status: "cancelled",
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
    } catch (err) {
      console.error("Cancellation failed", err);

      const errorMsg = err.response?.data?.status;

      alert(
        Array.isArray(errorMsg)
          ? errorMsg[0]
          : "Failed to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =====================================
  // DOWNLOAD TICKET
  // =====================================

  const downloadTicket = async (bookingId) => {
    try {
      setDownloadingId(bookingId);

      const response = await API.get(
        `/bookings/${bookingId}/download-ticket/`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `CineHub_Ticket_CH${String(
        bookingId
      ).padStart(5, "0")}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error("Ticket download failed", err);
      alert("Failed to download ticket.");
    } finally {
      setDownloadingId(null);
    }
  };

  // =====================================
  // LOGIN REQUIRED
  // =====================================

  if (!user) {
    return (
      <div className="bookings-page">
        <div className="booking-empty-card">
          <div className="booking-empty-icon">🔐</div>

          <h2>Login Required</h2>

          <p>
            Sign in to access your movie tickets and
            booking history.
          </p>

          <button
            onClick={() =>
              window.dispatchEvent(new Event("open-login"))
            }
          >
            Login to CineHub →
          </button>
        </div>
      </div>
    );
  }

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="booking-loading">
          <div className="booking-spinner"></div>

          <h3>Preparing your tickets...</h3>

          <p>Getting your cinema experience ready.</p>
        </div>
      </div>
    );
  }

  // =====================================
  // MAIN PAGE
  // =====================================

  return (
    <div className="bookings-page">
      <div className="bookings-container">

        {/* HEADER */}

        <header className="bookings-header">
          <div className="bookings-heading">
            <span className="bookings-eyebrow">
              YOUR CINEMA EXPERIENCE
            </span>

            <h1>
              My <span>Bookings</span>
              <span className="heading-ticket">🎟️</span>
            </h1>

            <p>
              Every movie. Every moment. All your tickets in one place.
            </p>
          </div>

          <div className="booking-header-decoration">
            <span>CH</span>
            <small>CINEHUB</small>
          </div>
        </header>

        {/* STATISTICS */}

        <section className="booking-stats">

          <div className="booking-stat-card">
            <div className="stat-icon total-icon">🎟️</div>

            <div>
              <span>Total Bookings</span>
              <h2>{count}</h2>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="stat-icon confirmed-icon">✓</div>

            <div>
              <span>Confirmed</span>
              <h2>{confirmed}</h2>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="stat-icon upcoming-icon">🎬</div>

            <div>
              <span>Upcoming</span>
              <h2>{upcoming}</h2>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="stat-icon finished-icon">✓</div>

            <div>
              <span>Show Finished</span>
              <h2>{finished}</h2>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="stat-icon cancelled-icon">✕</div>

            <div>
              <span>Cancelled</span>
              <h2>{cancelled}</h2>
            </div>
          </div>

        </section>

        {/* SECTION HEADING */}

        <div className="booking-section-heading">
          <div>
            <h2>Your Tickets</h2>
            <p>Your latest movie reservations</p>
          </div>

          <span className="booking-count">
            {count} {count === 1 ? "Booking" : "Bookings"}
          </span>
        </div>

        {/* ERROR */}

        {error && (
          <div className="booking-error">
            {error}

            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* NO BOOKINGS */}

        {!error && bookings.length === 0 && (
          <div className="booking-empty-card">
            <div className="booking-empty-icon">🎬</div>

            <h2>No Bookings Yet</h2>

            <p>
              Your next unforgettable cinema experience
              is waiting for you.
            </p>

            <button
              onClick={() => {
                window.location.href = "/movies";
              }}
            >
              Explore Movies →
            </button>
          </div>
        )}

        {/* BOOKING FILTERS */}

        {bookings.length > 0 && (
          <div className="booking-filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`booking-filter ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                <span>{filter.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* FILTER EMPTY STATE */}

        {!error &&
          bookings.length > 0 &&
          filteredBookings.length === 0 && (
            <div className="booking-filter-empty">
              <div>🎬</div>

              <h3>
                {activeFilter === "finished"
                  ? "No Finished Shows"
                  : activeFilter === "upcoming"
                  ? "No Upcoming Bookings"
                  : "No Cancelled Bookings"}
              </h3>

              <p>
                Your bookings in this category will appear here.
              </p>

              <button onClick={() => setActiveFilter("all")}>
                View All Bookings
              </button>
            </div>
          )}

        {/* BOOKING TICKETS */}

        <div className="booking-list">
          {filteredBookings.map((booking) => {
            const movie = booking.showtime?.movie;

            const passed = hasShowPassed(booking);

            const displayStatus = getDisplayStatus(booking);

            const isCancelled = booking.status === "cancelled";

            const isFinished = displayStatus === "finished";

            const theatre = booking.showtime?.screen?.theatre;

            return (
              <article
                className={`booking-ticket ${
                  isCancelled ? "ticket-cancelled" : ""
                } ${isFinished ? "ticket-finished" : ""}`}
                key={booking.id}
              >

                {/* POSTER */}

                <div className="ticket-poster-section">
                  <img
                    src={getPoster(movie)}
                    alt={movie?.title || "Movie"}
                    className="ticket-poster"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />

                  <div className="ticket-poster-overlay">
                    <span>CINEHUB</span>

                    <strong>
                      {movie?.title || "Movie"}
                    </strong>
                  </div>
                </div>

                {/* MAIN INFORMATION */}

                <div className="ticket-info">

                  <div className="ticket-topline">
                    <span className="ticket-reference">
                      BOOKING ID: CH
                      {String(booking.id).padStart(5, "0")}
                    </span>

                    <span
                      className={`ticket-status ${displayStatus}`}
                    >
                      <span className="status-dot"></span>

                      {displayStatus === "finished"
                        ? "SHOW FINISHED"
                        : displayStatus.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="ticket-movie-title">
                    {movie?.title || "Movie"}
                  </h3>

                  <p className="ticket-theatre">
                    📍 {theatre?.name || "Theatre"}
                    {theatre?.city ? ` · ${theatre.city}` : ""}
                  </p>

                  {/* DETAILS GRID */}

                  <div className="ticket-details-grid">

                    <div className="ticket-detail">
                      <span>DATE</span>

                      <strong>
                        {formatDate(booking.showtime?.show_date)}
                      </strong>
                    </div>

                    <div className="ticket-detail">
                      <span>SHOW TIME</span>

                      <strong>
                        {formatTime(booking.showtime?.show_time)}
                      </strong>
                    </div>

                    <div className="ticket-detail">
                      <span>SCREEN</span>

                      <strong>
                        {booking.showtime?.screen?.name || "N/A"}
                      </strong>
                    </div>

                    <div className="ticket-detail">
                      <span>SEATS</span>

                      <strong className="ticket-seats">
                        {booking.seats?.join(", ") || "N/A"}
                      </strong>
                    </div>

                  </div>

                  {/* FOOD */}

                  {booking.food_orders?.length > 0 && (
                    <div className="ticket-food">
                      <span>🍿 FOOD & BEVERAGES</span>

                      <div className="ticket-food-items">
                        {booking.food_orders.map((item, index) => (
                          <span key={index}>
                            {item.qty} × {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}

                  <div className="ticket-footer">

                    <div className="ticket-total">
                      <span>TOTAL PAID</span>

                      <strong>
                        ₹
                        {Number(
                          booking.total_amount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="ticket-actions">

                      {/* CANCEL BUTTON */}

                      {booking.status !== "cancelled" &&
                        !passed && (
                          <button
                            className="ticket-cancel-btn"
                            disabled={cancellingId === booking.id}
                            onClick={() => cancelBooking(booking.id)}
                          >
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : "✕ Cancel"}
                          </button>
                        )}

                      {/* DOWNLOAD TICKET */}

                      {booking.status === "confirmed" && (
                        <button
                          className="ticket-download-btn"
                          disabled={downloadingId === booking.id}
                          onClick={() => downloadTicket(booking.id)}
                        >
                          {downloadingId === booking.id
                            ? "Preparing..."
                            : "↓ Download PDF"}
                        </button>
                      )}

                    </div>
                  </div>

                  {/* FINISHED MESSAGE */}

                  {passed && !isCancelled && (
                    <div className="ticket-completed">
                      ✓ SHOW FINISHED — Thank you for choosing CineHub!
                    </div>
                  )}

                </div>

                {/* TICKET STUB */}

                <div className="ticket-stub">

                  <div className="stub-top">
                    <span>YOUR TICKET</span>
                    <strong>CH</strong>
                  </div>

                  <div className="stub-divider">
                    <span></span>
                  </div>

                  <div className="stub-seat">
                    <small>SEATS</small>

                    <strong>
                      {booking.seats?.length || 0}
                    </strong>
                  </div>

                  <div className="stub-barcode">
                    {Array.from({ length: 24 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          width: `${
                            i % 4 === 0
                              ? 4
                              : i % 3 === 0
                              ? 2
                              : 1
                          }px`,
                        }}
                      />
                    ))}
                  </div>

                  <small className="stub-number">
                    CH-{booking.id}
                  </small>

                </div>

              </article>
            );
          })}
        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="bookings-pagination">

            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              ← Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((num) => (
              <button
                key={num}
                className={`page-btn ${
                  num === page ? "active" : ""
                }`}
                onClick={() => goToPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next →
            </button>

          </div>
        )}

        {/* BOTTOM */}

        <footer className="bookings-bottom">
          <span>🎬</span>
          <p>Thanks for choosing CineHub. Enjoy the show!</p>
        </footer>

      </div>
    </div>
  );
}