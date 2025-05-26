import React from "react";

export default function DeveloperStudioLayout() {
  return (
    <main style={{ backgroundColor: "#0a0a0a", color: "#cbd5e1", minHeight: "100vh", padding: "2rem" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "3rem", color: "#60a5fa" }}>Developer Studio Tampa</h1>
        <p style={{ fontSize: "1.25rem", color: "#94a3b8" }}>
          Media & Consulting for the Modern Age
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {["Photography", "Consulting", "Creative Services"].map((title, i) => (
          <div key={i} style={{ background: "#1e293b", padding: "1rem", borderRadius: "0.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "#93c5fd" }}>{title}</h2>
            <p>
              {title === "Photography" && "Automotive, event, and street photography with a cinematic edge."}
              {title === "Consulting" && "Tech and media advice that cuts through the noise."}
              {title === "Creative Services" && "Visual storytelling and branded content that actually connects."}
            </p>
          </div>
        ))}
      </section>

      <footer style={{ textAlign: "center", marginTop: "3rem", color: "#64748b", fontSize: "0.875rem" }}>
        &copy; {new Date().getFullYear()} Developer Studio Tampa. All rights reserved.
      </footer>
    </main>
  );
}
