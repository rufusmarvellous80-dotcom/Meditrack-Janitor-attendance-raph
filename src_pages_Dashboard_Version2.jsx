import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { backgroundGradient, headerGradient } from "../utils/colors";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { facility, role } = location.state || { facility: "", role: "" };

  return (
    <div style={{ minHeight: "100vh", background: backgroundGradient }}>
      <header style={{ background: headerGradient, padding: 24, color: "#fff", fontSize: 22 }}>
        {facility || "Facility"} Dashboard — {role || "Role"}
      </header>
      <main style={{ padding: 32 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <button onClick={() => navigate("/shift-calendar")} style={cardBtnStyle}>Shift Calendar</button>
          <button onClick={() => navigate("/attendance")} style={cardBtnStyle}>Attendance</button>
          <button onClick={() => navigate("/report")} style={cardBtnStyle}>Reports</button>
        </div>
      </main>
    </div>
  );
}

const cardBtnStyle = {
  padding: 28, fontSize: 18, borderRadius: 10, background: "#fff", border: "none", cursor: "pointer"
};