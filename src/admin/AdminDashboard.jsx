import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ movies: 0, bookings: 0, users: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, bookingsRes, usersRes] = await Promise.all([
          API.get("/movies/list/?page_size=1000"),
          API.get("/bookings/?page_size=1000"),
          API.get("/users/all/?page_size=1000"),
        ]);
        const movieData = moviesRes.data.results || moviesRes.data;
        const bookingData = bookingsRes.data.results || bookingsRes.data;
        const userData = usersRes.data.results || usersRes.data;
        const revenue = bookingData.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

        setStats({
          movies: movieData.length,
          bookings: bookingData.length,
          users: userData.length,
          revenue: revenue.toFixed(2),
        });
        setBookings(bookingData);
        setMovies(movieData);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Bookings by status for pie chart
  const bookingStatusData = [
    { name: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, color: "#4caf50" },
    { name: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "#f5a623" },
    { name: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, color: "#f84464" },
  ].filter(d => d.value > 0);

  // Bookings per movie for bar chart
  const bookingsPerMovie = movies.map(movie => ({
    name: movie.title.length > 12 ? movie.title.slice(0, 12) + "…" : movie.title,
    bookings: bookings.filter(b => b.showtime?.movie?.id === movie.id).length,
    revenue: bookings
      .filter(b => b.showtime?.movie?.id === movie.id)
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
  })).filter(m => m.bookings > 0);

  // Bookings over last 7 days for line chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      bookings: bookings.filter(b => b.booked_at?.startsWith(dateStr)).length,
      revenue: bookings
        .filter(b => b.booked_at?.startsWith(dateStr))
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
    };
  });

  // Category distribution
  const categoryData = [
    { name: "In Theatres", value: movies.filter(m => m.category === "in_theatres").length, color: "#f84464" },
    { name: "OTT", value: movies.filter(m => m.category === "ott").length, color: "#1db954" },
    { name: "Coming Soon", value: movies.filter(m => m.category === "coming_soon").length, color: "#f5a623" },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: "Total Movies", value: stats.movies, icon: "🎬", color: "#f84464", bg: "rgba(248,68,100,0.1)" },
    { label: "Total Bookings", value: stats.bookings, icon: "🎟️", color: "#f5a623", bg: "rgba(245,166,35,0.1)" },
    { label: "Total Users", value: stats.users, icon: "👥", color: "#4caf50", bg: "rgba(76,175,80,0.1)" },
    { label: "Total Revenue", value: `₹${stats.revenue}`, icon: "💰", color: "#2196f3", bg: "rgba(33,150,243,0.1)" },
  ];

  const tooltipStyle = {
    backgroundColor: "#0e0e1a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#fff",
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading dashboard...</p>;

  return (
    <div style={{ color: "#fff" }}>
      <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "28px" }}>
        📊 Dashboard
      </h2>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            background: "#0e0e1a", borderRadius: "14px", padding: "20px 24px",
            border: `1px solid ${card.color}22`, position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: card.color
            }} />
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: card.bg, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", marginBottom: "12px"
            }}>
              {card.icon}
            </div>
            <p style={{ color: "#555", fontSize: "12px", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "1px" }}>
              {card.label}
            </p>
            <h2 style={{ color: "#fff", margin: 0, fontSize: "26px", fontWeight: 900 }}>
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      {/* ROW 1: LINE CHART + PIE CHART */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* BOOKINGS OVER TIME */}
        <div style={{ background: "#0e0e1a", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#fff" }}>
            📈 Bookings — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 11 }} />
              <YAxis tick={{ fill: "#555", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone" dataKey="bookings" stroke="#f84464"
                strokeWidth={2.5} dot={{ fill: "#f84464", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BOOKING STATUS PIE */}
        <div style={{ background: "#0e0e1a", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#fff" }}>
            🎯 Booking Status
          </h3>
          {bookingStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={bookingStatusData} cx="50%" cy="45%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value"
                >
                  {bookingStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ color: "#aaa", fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#555", textAlign: "center", marginTop: "60px" }}>No booking data yet</p>
          )}
        </div>
      </div>

      {/* ROW 2: BAR CHART + PIE CHART */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* BOOKINGS PER MOVIE */}
        <div style={{ background: "#0e0e1a", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#fff" }}>
            🎬 Bookings per Movie
          </h3>
          {bookingsPerMovie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bookingsPerMovie} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} />
                <YAxis tick={{ fill: "#555", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="bookings" fill="#f84464" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#555", textAlign: "center", marginTop: "60px" }}>No booking data yet</p>
          )}
        </div>

        {/* MOVIE CATEGORY PIE */}
        <div style={{ background: "#0e0e1a", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#fff" }}>
            🎭 Movie Categories
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData} cx="50%" cy="45%"
                  outerRadius={80} paddingAngle={4} dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ color: "#aaa", fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#555", textAlign: "center", marginTop: "60px" }}>No movie data yet</p>
          )}
        </div>
      </div>

      {/* ROW 3: REVENUE CHART */}
      <div style={{ background: "#0e0e1a", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#fff" }}>
          💰 Revenue — Last 7 Days
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 11 }} />
            <YAxis tick={{ fill: "#555", fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`₹${value}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#2196f3" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}