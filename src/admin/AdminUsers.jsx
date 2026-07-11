import React, { useState, useEffect } from "react";
import API from "../utils/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/users/all/?page_size=1000");
        setUsers(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleBlock = async (id, isActive) => {
    try {
      await API.patch(`/users/manage/${id}/`, { is_active: !isActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: !isActive } : u))
      );
    } catch (err) {
      alert("Failed to update user.");
    }
  };

  if (loading) return <p style={{ color: "#fff" }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>👥 User Management</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#16213e" }}>
            <th style={th}>Email</th>
            <th style={th}>Username</th>
            <th style={th}>Role</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ ...td, color: "#fff" }}>{user.email}</td>
              <td style={td}>{user.username}</td>
              <td style={td}>{user.role}</td>
              <td style={td}>
                <span style={{
                  padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                  background: user.is_active ? "#4caf50" : "#e50914", color: "#fff"
                }}>
                  {user.is_active ? "Active" : "Blocked"}
                </span>
              </td>
              <td style={td}>
                <button
                  onClick={() => toggleBlock(user.id, user.is_active)}
                  style={{
                    background: user.is_active ? "#e50914" : "#4caf50",
                    color: "#fff", border: "none", padding: "6px 12px",
                    borderRadius: "6px", cursor: "pointer"
                  }}
                >
                  {user.is_active ? "Block" : "Unblock"}
                </button>
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