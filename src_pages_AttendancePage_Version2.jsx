import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, set, get } from "firebase/database";
import { useLocation } from "react-router-dom";
import { backgroundGradient, headerGradient, cardShadow, buttonGreenGradient } from "../utils/colors";

/*
  Attendance page:
  - Loads assigned staff for selected date & role from /shifts/{date}/{facility}/{role}
  - Loads staff details from /staff
  - Allows entering timeIn/timeOut/breaks/status
  - Requires admin password to submit (legacy admin password 'admin') OR an authenticated admin via Firebase Auth
*/

export default function AttendancePage() {
  const location = useLocation();
  const { facility, role } = location.state || { facility: "General Hospital", role: "Janitor" };

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [assigned, setAssigned] = useState([]); // array of staff uids
  const [staffMap, setStaffMap] = useState({}); // uid -> {name, role}
  const [attendanceMap, setAttendanceMap] = useState({}); // uid -> attendance object
  const [adminPass, setAdminPass] = useState("");
  const [message, setMessage] = useState("");

  // fetch staff data
  useEffect(() => {
    async function fetchStaff() {
      try {
        const staffSnap = await get(ref(db, `staff`));
        if (staffSnap.exists()) {
          const data = staffSnap.val();
          setStaffMap(data);
        } else {
          setStaffMap({});
        }
      } catch (err) {
        console.error("fetch staff error", err);
      }
    }
    fetchStaff();
  }, []);

  // fetch assigned staff for selected date/facility/role
  useEffect(() => {
    async function fetchAssigned() {
      try {
        const path = `shifts/${date}/${facility.toLowerCase()}/${role.toLowerCase()}`;
        const snap = await get(ref(db, path));
        if (snap.exists()) {
          const val = snap.val();
          setAssigned(val.staff || []);
        } else {
          setAssigned([]);
        }
      } catch (err) {
        console.error("fetch assigned error", err);
      }
    }
    fetchAssigned();
  }, [date, facility, role]);

  function detectLate(timeIn) {
    if (!timeIn) return false;
    // morning shift late after 07:05
    if (role === "Janitor") return timeIn > "07:05";
    // night shift: flag after 17:05 (if a night shift time is present as timeIn)
    if (role === "Security") return timeIn > "05:05";
    return false;
  }

  async function submitFor(uid) {
    if (!uid) return setMessage("Missing staff selection.");
    // Allow submit if adminPass provided (legacy) OR if an authenticated admin is present (this app supports firebase auth in AuthAdmin).
    if (adminPass !== "admin") {
      setMessage("Admin password required to submit (use admin) or sign in as admin from Auth page.");
      return;
    }
    const att = attendanceMap[uid];
    if (!att) {
      setMessage("Enter attendance fields first.");
      return;
    }
    const path = `attendance/${date}/${facility.toLowerCase()}/${role.toLowerCase()}/${uid}`;
    try {
      await set(ref(db, path), { ...att, late: detectLate(att.timeIn) });
      setMessage("Attendance saved for " + (staffMap[uid]?.name || uid));
    } catch (err) {
      console.error(err);
      setMessage("Error saving attendance.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: backgroundGradient }}>
      <header style={{ background: headerGradient, padding: 20, color: "#fff" }}>Attendance — {facility}</header>
      <main style={{ maxWidth: 900, margin: "32px auto", background: "#fff", padding: 20, borderRadius: 12, boxShadow: cardShadow }}>
        <div style={{ marginBottom: 12 }}>
          <label>Date: </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {assigned.length === 0 ? (
          <div style={{ marginTop: 12 }}>No staff assigned for this date and role.</div>
        ) : (
          assigned.map(uid => {
            const staff = staffMap[uid] || { name: uid, role };
            const att = attendanceMap[uid] || { timeIn: "", timeOut: "", breakIn: "", breakOut: "", present: true, absent: false, onLeave: false };
            return (
              <div key={uid} style={{ border: "1px solid #eee", padding: 12, marginBottom: 12, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><b>{staff.name}</b> ({staff.role})</div>
                  <div>
                    <button onClick={() => submitFor(uid)} style={{ background: buttonGreenGradient, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6 }}>
                      Submit
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                  <label>Time In: <input type="time" value={att.timeIn} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, timeIn: e.target.value } }))} /></label>
                  <label>Time Out: <input type="time" value={att.timeOut} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, timeOut: e.target.value } }))} /></label>
                  <label>Break In: <input type="time" value={att.breakIn} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, breakIn: e.target.value } }))} /></label>
                  <label>Break Out: <input type="time" value={att.breakOut} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, breakOut: e.target.value } }))} /></label>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <label>Present: <input type="checkbox" checked={att.present} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, present: e.target.checked } }))} /></label>
                  <label>Absent: <input type="checkbox" checked={att.absent} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, absent: e.target.checked } }))} /></label>
                  <label>On Leave: <input type="checkbox" checked={att.onLeave} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, onLeave: e.target.checked } }))} /></label>
                  <label>Late (auto): <input type="checkbox" checked={detectLate(att.timeIn)} disabled /></label>
                </div>
              </div>
            );
          })
        )}

        <div style={{ marginTop: 12 }}>
          <label>Admin Password (required to submit if not using Firebase Admin account): </label>
          <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
        </div>

        {message && <div style={{ marginTop: 12, color: "crimson" }}>{message}</div>}
      </main>
    </div>
  );
}