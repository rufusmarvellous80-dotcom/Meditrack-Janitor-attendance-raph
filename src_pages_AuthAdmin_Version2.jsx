import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { headerGradient, cardShadow, backgroundGradient, buttonBlueGradient } from "../utils/colors";

/*
  Simple Firebase Auth scaffold:
  - Register an admin user (stores user role in /users/{uid})
  - Login as admin to access admin-only features
*/

export default function AuthAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // or 'register'
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleRegister() {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
      // store role mapping in Realtime DB
      await set(ref(db, `users/${uid}`), { email, role: "admin" });
      setMessage("Registered admin. Now you can sign in.");
      setMode("login");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Signed in as admin.");
      // navigate to dashboard as admin (pass facility empty)
      navigate("/dashboard", { state: { facility: "General Hospital", role: "Admin" } });
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: backgroundGradient }}>
      <header style={{ background: headerGradient, padding: 20, color: "#fff" }}>Admin Auth</header>
      <main style={{ maxWidth: 560, margin: "32px auto", background: "#fff", padding: 24, borderRadius: 12, boxShadow: cardShadow }}>
        <h3>{mode === "login" ? "Admin Sign In" : "Register Admin"}</h3>
        <div>
          <label>Email:&nbsp;</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password:&nbsp;</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {mode === "register" ? (
          <button onClick={handleRegister} style={{ background: buttonBlueGradient, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, marginTop: 12 }}>
            Register Admin
          </button>
        ) : (
          <button onClick={handleLogin} style={{ background: buttonBlueGradient, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, marginTop: 12 }}>
            Sign In
          </button>
        )}
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ background: "transparent", border: "none", color: "#0072ff", cursor: "pointer" }}>
            {mode === "login" ? "Register new admin" : "Back to login"}
          </button>
        </div>
        {message && <div style={{ marginTop: 12, color: "crimson" }}>{message}</div>}
      </main>
    </div>
  );
}