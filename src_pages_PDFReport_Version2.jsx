import React, { useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import { jsPDF } from "jspdf";
import { backgroundGradient, headerGradient, cardShadow, buttonBlueGradient } from "../utils/colors";

/*
  Simple PDF generation using jsPDF:
  - Loads attendance for chosen date and facility/role combination and generates a basic PDF table
*/

export default function PDFReport() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [facility, setFacility] = useState("General Hospital");
  const [role, setRole] = useState("Janitor");
  const [message, setMessage] = useState("");

  async function generatePDF() {
    setMessage("Generating...");
    try {
      const path = `attendance/${date}/${facility.toLowerCase()}/${role.toLowerCase()}`;
      const snap = await get(ref(db, path));
      const attData = snap.exists() ? snap.val() : null;

      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Meditrack Limited — Attendance Summary", 14, 20);
      doc.setFontSize(10);
      doc.text(`Date: ${date}`, 14, 28);
      doc.text(`Facility: ${facility}`, 14, 34);
      doc.text(`Role: ${role}`, 14, 40);

      const startY = 48;
      doc.autoTable = doc.autoTable || null; // avoid errors if plugin not available
      // If autoTable plugin not available, build simple table manually
      let y = startY;
      doc.setFontSize(11);
      doc.text("Name", 14, y);
      doc.text("Time In", 80, y);
      doc.text("Time Out", 115, y);
      doc.text("Present", 150, y);
      doc.text("Late", 174, y);
      y += 6;

      if (!attData) {
        doc.text("No attendance records found for this date.", 14, y);
      } else {
        // attData is expected as { uid: {timeIn, timeOut, present, late, ...}, ...}
        for (const uid of Object.keys(attData)) {
          const r = attData[uid];
          const name = r.name || uid;
          doc.text(name.toString().slice(0, 30), 14, y);
          doc.text(r.timeIn || "-", 80, y);
          doc.text(r.timeOut || "-", 115, y);
          doc.text((r.present ? "Yes" : "No"), 150, y);
          doc.text((r.late ? "Yes" : "No"), 174, y);
          y += 6;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        }
      }

      doc.save(`attendance-${facility.replace(/\s+/g, "-")}-${role}-${date}.pdf`);
      setMessage("PDF downloaded.");
    } catch (err) {
      console.error(err);
      setMessage("Error generating PDF.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: backgroundGradient }}>
      <header style={{ background: headerGradient, padding: 20, color: "#fff" }}>Summary Reports</header>
      <main style={{ maxWidth: 720, margin: "32px auto", background: "#fff", padding: 24, borderRadius: 12, boxShadow: cardShadow }}>
        <div style={{ marginBottom: 12 }}>
          <label>Date: </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Facility: </label>
          <select value={facility} onChange={e => setFacility(e.target.value)}>
            <option>General Hospital</option>
            <option>LASUCOM</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Role: </label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option>Janitor</option>
            <option>Security</option>
          </select>
        </div>

        <button onClick={generatePDF} style={{ background: buttonBlueGradient, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8 }}>
          Download PDF
        </button>

        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </main>
    </div>
  );
}