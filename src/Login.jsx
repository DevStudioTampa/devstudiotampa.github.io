import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebaseConfig"; // ✅ pull the initialized auth from config

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        alert("Registration successful");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20, color: "#e2e8f0" }}>
      <h2>{isRegistering ? "Create Account" : "Login"}</h2>
      <form onSubmit={handleAuth}>
        {isRegistering && (
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ marginTop: 10 }}>
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: 10 }}>
        {isRegistering ? "Have an account? Log in" : "New here? Register"}
      </button>
    </div>
  );
}
