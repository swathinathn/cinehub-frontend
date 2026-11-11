import React from "react";
import "./admin.css";

export default function AdminPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <div className="admin-pagination-container">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="admin-page-btn"
      >
        ← Prev
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="admin-page-btn">1</button>
          {start > 2 && <span style={{ color: "#555" }}>...</span>}
        </>
      )}

      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`admin-page-btn ${num === currentPage ? "active" : ""}`}
        >
          {num}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: "#555" }}>...</span>}
          <button onClick={() => onPageChange(totalPages)} className="admin-page-btn">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="admin-page-btn"
      >
        Next →
      </button>
    </div>
  );
}