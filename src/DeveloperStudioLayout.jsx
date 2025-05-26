// src/DeveloperStudioLayout.jsx
import React from "react";
import Header from "./Header.jsx";

export default function DeveloperStudioLayout() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Header />
      <main style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1rem" }}>Welcome to Developer Studio Tampa</h1>
        <p style={{ color: "#4b5563" }}>
          Your hub for content, reviews, and creative services.
        </p>
      </main>
    </div>
  );
}
