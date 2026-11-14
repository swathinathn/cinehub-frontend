import React, { useEffect, useState } from "react";
import API from "../utils/axios";
import "./admin.css";

const emptyTheatre = { name: "", location: "", city: "" };

export default function AdminTheatres() {
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: "theatre" | "screen", item }
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [t, s] = await Promise.all([
        API.get("/movies/theatres/?page_size=1000"),
        API.get("/movies/screens/?page_size=1000"),
      ]);
      setTheatres(t.data.results || t.data);
      setScreens(s.data.results || s.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openTheatre = (item = null) => {
    setError("");
    setForm(item ? { name: item.name, location: item.location, city: item.city } : emptyTheatre);
    setModal({ type: "theatre", item });
  };

  const openScreen = (item = null, theatreId = "") => {
    setError("");
    setForm(
      item
        ? { theatre_id: item.theatre?.id, name: item.name, total_seats: item.total_seats }
        : { theatre_id: theatreId, name: "", total_seats: 84 }
    );
    setModal({ type: "screen", item });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const isTheatre = modal.type === "theatre";
    const url = isTheatre ? "/movies/theatres/" : "/movies/screens/";
    const payload = isTheatre
      ? form
      : {
          theatre_id: Number(form.theatre_id),
          name: form.name,
          total_seats: Number(form.total_seats),
        };

    try {
      if (modal.item) {
        await API.patch(`${url}${modal.item.id}/`, payload);
      } else {
        await API.post(url, payload);
      }
      setModal(null);
      load();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`)
              .join("  |  ")
          : "Could not save. Please try again.";
      setError(
        err.response?.status === 403 ? "You don't have permission to do this." : msg
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (type, item) => {
    const warning =
      type === "theatre"
        ? `Delete "${item.name}"? Its screens, showtimes and bookings will be deleted too.`
        : `Delete screen "${item.name}"? Its showtimes and bookings will be deleted too.`;
    if (!window.confirm(warning)) return;

    try {
      await API.delete(`/movies/${type === "theatre" ? "theatres" : "screens"}/${item.id}/`);
      load();
    } catch {
      alert("Failed to delete.");
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;

  return (
    <div>
      <div style={bar}>
        <h2 style={{ color: "#fff", margin: 0 }}>🏛️ Theatres & Screens</h2>
        <button style={primaryBtn} onClick={() => openTheatre()}>
          ➕ Add Theatre
        </button>
      </div>

      {theatres.length === 0 && (
        <p style={{ color: "#888" }}>No theatres yet. Add a theatre first, then add screens to it.</p>
      )}

      {theatres.map((theatre) => {
        const mine = screens.filter((s) => s.theatre?.id === theatre.id);
        return (
          <div key={theatre.id} style={card}>
            <div style={bar}>
              <div>
                <h3 style={{ color: "#fff", margin: "0 0 4px" }}>{theatre.name}</h3>
                <span style={{ color: "#888", fontSize: "13px" }}>
                  {theatre.location} · {theatre.city}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={ghostBtn} onClick={() => openScreen(null, theatre.id)}>
                  ➕ Add Screen
                </button>
                <button style={ghostBtn} onClick={() => openTheatre(theatre)}>
                  ✏️ Edit
                </button>
                <button style={dangerBtn} onClick={() => remove("theatre", theatre)}>
                  🗑️
                </button>
              </div>
            </div>

            {mine.length === 0 ? (
              <p style={{ color: "#666", fontSize: "13px", margin: "10px 0 0" }}>
                No screens yet for this theatre.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "14px" }}>
                {mine.map((screen) => (
                  <div key={screen.id} style={chip}>
                    <strong style={{ color: "#fff" }}>{screen.name}</strong>
                    <span style={{ color: "#888", fontSize: "12px" }}>{screen.total_seats} seats</span>
                    <button style={linkBtn} onClick={() => openScreen(screen)}>
                      Edit
                    </button>
                    <button style={{ ...linkBtn, color: "#e50914" }} onClick={() => remove("screen", screen)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {modal && (
        <div style={overlay} onClick={() => setModal(null)}>
          <form style={dialog} onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3 style={{ color: "#fff", margin: "0 0 18px" }}>
              {modal.item ? "Edit" : "Add"} {modal.type === "theatre" ? "Theatre" : "Screen"}
            </h3>

            {modal.type === "theatre" ? (
              <>
                <Field label="Theatre name *">
                  <input style={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Location / address *">
                  <input style={input} required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </Field>
                <Field label="City *">
                  <input style={input} required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Theatre *">
                  <select style={input} required value={form.theatre_id} onChange={(e) => setForm({ ...form, theatre_id: e.target.value })}>
                    <option value="">Select a theatre</option>
                    {theatres.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} - {t.city}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Screen name *">
                  <input style={input} required placeholder="e.g. Screen 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Total seats *">
                  <input style={input} type="number" min="1" max="500" required value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} />
                </Field>
              </>
            )}

            {error && <p style={{ color: "#f84464", fontSize: "13px" }}>{error}</p>}

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" style={{ ...primaryBtn, flex: 1 }} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" style={ghostBtn} onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
      <label style={{ color: "#aaa", fontSize: "12px", fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

const bar = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" };
const card = { background: "#0e0e1a", border: "1px solid #1e1e30", borderRadius: "14px", padding: "20px", marginBottom: "16px" };
const chip = { display: "flex", alignItems: "center", gap: "12px", background: "#16213e", border: "1px solid #24305a", borderRadius: "10px", padding: "8px 14px" };
const primaryBtn = { background: "#e50914", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 };
const ghostBtn = { background: "#16213e", color: "#7aa2ff", border: "1px solid #7aa2ff33", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };
const dangerBtn = { background: "rgba(229,9,20,0.1)", color: "#e50914", border: "1px solid rgba(229,9,20,0.25)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" };
const linkBtn = { background: "none", border: "none", color: "#7aa2ff", cursor: "pointer", fontSize: "12px", padding: 0 };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" };
const dialog = { background: "#1a1a2e", border: "1px solid #33334d", borderRadius: "16px", padding: "28px", width: "420px", maxWidth: "100%" };
const input = { background: "#121224", border: "1px solid #33334d", color: "#fff", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", outline: "none" };