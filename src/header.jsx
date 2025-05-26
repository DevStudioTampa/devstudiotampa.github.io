// src/Header.jsx
import React from "react";

const Header = () => {
  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 2rem",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ fontWeight: "bold", fontSize: "1.5rem", fontFamily: "Arial, sans-serif", color: "#000" }}>
        DST
      </div>
      <button style={{
        backgroundColor: "#2563eb",
        color: "#fff",
        border: "none",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        cursor: "pointer"
      }}>
        Sign In
      </button>
    </header>
  );
};

export default Header;
