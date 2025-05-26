import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import app from "./firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      if (mode === "register") {
        res = await createUserWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", res.user.uid);
        await setDoc(userRef, {
          email,
          displayName,
          role: "user", // Default role
        });
      } else {
        res = await signInWithEmailAndPassword(auth, email, password);
      }

      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      setUser({ id: res.user.uid, ...userDoc.data() });
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (user) {
    return (
      <div style={{ padding: "2rem", color: "#cbd5e1" }}>
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <p>Role: {user.role}</p>
        {user.role === "admin" && <p>You have permission to post content.</p>}
        {user.role !== "admin" && <p>You’re logged in as a regular user.</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", background: "#1e293b", borderRadius: "0.5rem" }}>
      <h2 style={{ marginBottom: "1rem", color: "#93c5fd" }}>
        {mode === "login" ? "Login" : "Register"}
      </h2>

      {mode === "register" && (
        <input
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          style={inputStyle}
        />
      )}

      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={inputStyle}
      />

      <button type="submit" style={buttonStyle}>
        {mode === "login" ? "Login" : "Register"}
      </button>

      <p
        style={{ marginTop: "1rem", cursor: "pointer", color: "#60a5fa" }}
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Need an account?" : "Already have an account?"}
      </p>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  marginBottom: "1rem",
  borderRadius: "0.25rem",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};

const buttonStyle = {
  width: "100%",
  padding: "0.75rem",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "0.25rem",
  cursor: "pointer",
};
