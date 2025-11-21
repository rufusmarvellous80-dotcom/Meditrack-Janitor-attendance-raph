import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, set, get, child } from "firebase/database";
import { useLocation } from "react-router-dom";
import { backgroundGradient, headerGradient, cardShadow, buttonGreenGradient } from "../utils/colors";

/*
  Admin-only shift assignment view.
  - Reads staff from /staff
  - Writes shift assignments to /shifts/{date}/{facility}/{role}
*/

export default function ShiftCalendar() {
  const location = useLocation();
  const { facility, role } = location.state || { facility: "General Hospital", role: "Admin" };

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shiftType, setShiftType] = useState("Morning");
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [supervisor, setSupervisor] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // fetch staff list
    async function fetchStaff() {
      try {
        const snapshot = await get(child(ref(db), `staff`));
        const data = snapshot.exists() ? snapshot.val() : null;
        if (data) {
          const arr = Object.keys(data).map(k => ({ uid: k, ...data[k] }));
          setStaff(arr);
        } else {
          setStaff([]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStaff();
  }, []);

  const isAdmin = role === "Admin";

  async function saveShift() {
    if (!isAdmin) return setMessage("Only admins can assign shifts.");
    if (selectedStaff.length === 0) return setMessage("Pick at least one staff.");
    const path = `shifts/${selectedDate}/${facility.toLowerCase()}/${shiftType.toLowerCase()}`;
    try {
      await set(ref(db, path), { staff: selectedStaff, supervisor });
      setMessage("Shift saved.");
    } catch (err) {
      setMessage("Error saving shift.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: backgroundGradient }}>
      <header style={{ background: headerGradient, padding: 20, color: "#fff" }}>
        Shift Calendar — {facility}
      </header>

      <main style={{ maxWidth: 720, margin: "32px auto", background: "#fff", padding: 20, borderRadius: 12, boxShadow: cardShadow }}>
        {!isAdmin && <div style={{ color: "crimson" }}>Only admins can assign staff.</div>}

        <div style={{ marginBottom: 12 }}>
          <label>Date: </label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Shift Type: </label>
          <select value={shiftType} onChange={e => setShiftType(e.target.value)}>
            <option value="Morning">Morning (Janitors)</option>
            <option value="Night">Night (Janitors)</option>
            <option value="Security">Security</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Staff:</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {staff.filter(s => shiftType === "Security" ? s.role === "Security" : s.role === "Janitor").map(s => (
              <label key={s.uid} style={{ padding: 6, border: "1px solid #eee", borderRadius: 6 }}>
                <input
                  type="checkbox"
                  checked={selectedStaff.includes(s.uid)}
                  onChange={e => {
                    const checked = e.target.checked;
                    setSelectedStaff(prev => checked ? [...prev, s.uid] : prev.filter(id => id !== s.uid));
                  }}
                />
                {" "}{s.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Supervisor: </label>
          <input value={supervisor} onChange={e => setSupervisor(e.target.value)} />
        </div>

        <button onClick={saveShift} disabled={!isAdmin} style={{ background: buttonGreenGradient, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8 }}>
          Save Shift
        </button>

        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </main>
    </div>
  );
}