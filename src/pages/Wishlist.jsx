import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios";
import MovieCard from "../components/MovieCard";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("cinehub-user"));

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await API.get("/movies/wishlist/");
        setWishlist(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load wishlist", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchWishlist();
    else setLoading(false);
  }, []);

  const removeFromWishlist = async (id) => {
    try {
      await API.delete(`/movies/wishlist/${id}/`);
      setWishlist(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      alert("Failed to remove from wishlist.");
    }
  };

  if (!user) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>
      <h2>Please login to view your wishlist</h2>
    </div>
  );

  if (loading) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>
      Loading wishlist...
    </div>
  );

  if (wishlist.length === 0) return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>
      <h2>❤️ Your Wishlist is Empty</h2>
      <p style={{ color: "#555", marginTop: "10px" }}>Add movies you love by clicking the ❤️ button!</p>
      <button
        onClick={() => navigate("/movies")}
        style={{
          marginTop: "20px", background: "#f84464", color: "#fff",
          border: "none", padding: "12px 28px", borderRadius: "10px",
          cursor: "pointer", fontWeight: 700
        }}
      >
        Browse Movies
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <h2 style={{ color: "#fff", marginBottom: "24px" }}>❤️ My Wishlist ({wishlist.length})</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "20px" }}>
        {wishlist.map((item) => (
          <div key={item.id} style={{ position: "relative" }}>
            <MovieCard movie={item.movie} />
            <button
              onClick={() => removeFromWishlist(item.id)}
              style={{
                position: "absolute", top: "8px", left: "8px",
                background: "rgba(248,68,100,0.9)", color: "#fff",
                border: "none", borderRadius: "6px", padding: "4px 8px",
                fontSize: "11px", fontWeight: 700, cursor: "pointer",
                zIndex: 10
              }}
            >
              ❌ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}