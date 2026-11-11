import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import AdminPagination from "./AdminPagination";
import "./admin.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/users/all/?page=${currentPage}&page_size=${ROWS_PER_PAGE}`);
      setUsers(res.data.results || res.data);
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

  if (loading) return <p className="admin-page">Loading...</p>;

  return (
    <div className="admin-page">
      <h2 className="admin-header">👥 User Management</h2>
      <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", background: "#0e0e1a", borderRadius: "12px", overflow: "hidden" }}>
        <thead>
          <tr style={{ background: "#16213e", color: "#fff" }}>
            <th style={th}>Email</th>
            <th style={th}>Username</th>
            <th style={th}>Role</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #222" }}>
              <td style={{ ...td, color: "#fff", fontWeight: "600" }}>{user.email}</td>
              <td style={td}>{user.username}</td>
              <td style={td}>{user.role}</td>
              <td style={td}>
                <span style={{
                  padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
                  background: user.is_active ? "rgba(76,175,80,0.15)" : "rgba(229,9,20,0.15)", color: user.is_active ? "#4caf50" : "#e50914"
                }}>
                  {user.is_active ? "ACTIVE" : "BLOCKED"}
                </span>
              </td>
              <td style={td}>
                <button
                  onClick={() => toggleBlock(user.id, user.is_active)}
                  className={user.is_active ? "admin-btn-danger" : "admin-btn-secondary"}
                  style={{ color: !user.is_active && "#4caf50", borderColor: !user.is_active && "rgba(76,175,80,0.3)", background: !user.is_active && "rgba(76,175,80,0.1)" }}
                >
                  {user.is_active ? "Block" : "Unblock"}
                </button>
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