import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backgroundGradient, buttonGreenGradient, cardShadow } from "../utils/colors";

/*
  This login implements the facility+role password flow from the spec.
  Admin operations and Auth are available under /auth-admin (setup via Firebase Auth).
*/

const rolePasswords = {
  "General Hospital": { Janitor: "admin1", Security: "admin2" },
  "LASUCOM": { Janitor: "admin1", Security: "admin2" },
  Admin: { Admin: "admin" }
};

export default function LoginPage() {
  const [facility, setFacility] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogin() {
    if (!facility || !role || !password) {
      setError("All fields required.");
      return;
    }
    let correctPassword = "";
    if (role === "Admin") correctPassword = rolePasswords.Admin.Admin;
    else correctPassword = rolePasswords[facility]?.[role];
    if (password === correctPassword) {
      setError("");
      // pass facility & role along as location state
      navigate("/dashboard", { state: { facility, role } });
    } else setError("Invalid login details.");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: backgroundGradient,
      display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <div style={{
        background: "#fff", padding: 36, borderRadius: 16,
        boxShadow: cardShadow, minWidth: 320
      }}>
        <h2 style={{ marginBottom: 20 }}>Meditrack Limited</h2>
        <div style={{ marginBottom: 12 }}>
          <label>Facility:&nbsp;</label>
          <select value={facility} onChange={e => setFacility(e.target.value)}>
            <option value="">Select</option>
            <option value="General Hospital">General Hospital</option>
            <option value="LASUCOM">LASUCOM</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Role:&nbsp;</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Select</option>
            <option value="Janitor">Janitor</option>
            <option value="Security">Security</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password:&nbsp;</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button
          style={{
            width: "100%", padding: 10, marginTop: 8,
            background: buttonGreenGradient, color: "#fff",
            border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer"
          }}
          onClick={handleLogin}
        >
          Login
        </button>
        <div style={{ marginTop: 12, fontSize: 14 }}>
          <button onClick={() => navigate("/auth-admin")} style={{
            marginTop: 8, background: "transparent", border: "none", color: "#0072ff", cursor: "pointer"
          }}>
            Admin: Sign up / Sign in (Firebase Auth)
          </button>
        </div>
        {error && <div style={{ color: "red", marginTop: 15 }}>{error}</div>}
      </div>
    </div>
  );
}