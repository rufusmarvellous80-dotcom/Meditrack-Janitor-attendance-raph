import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, set, get, child } from "firebase/database";
import { useLocation } from "react-router-dom";
import { backgroundGradient, headerGradient, cardShadow, buttonGreenGradient } from "../utils/colors";

/*
  Attendance page:
  - Loads assigned staff for selected date & role from /shifts/{date}/{facility}/{role}
  - Allows entering timeIn/timeOut/breaks/status
  - Requires admin password to submit (legacy admin password 'admin') OR Firebase auth admin to be signed in
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

  useEffect(() => {
    // fetch staff list
    async function fetchStaff() {
      try {
        const snapshot = await get(child(ref(db), `staff`));
        const data = snapshot.exists() ? snapshot.val() : null;
        if (data) {
          setStaffMap(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStaff();
  }, []);

  useEffect(() => {
    // fetch assigned staff for date/facility/role
    async function fetchAssigned() {
      try {
        const path = `shifts/${date}/${facility.toLowerCase()}/${role.toLowerCase()}`;
        const snapshot = await get(child(ref(db), path));
        if (snapshot.exists()) {
          const val = snapshot.val();
          setAssigned(val.staff || []);
        } else {
          setAssigned([]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAssigned();
  }, [date, facility, role]);

  function detectLate(timeIn) {
    if (!timeIn) return false;
    // morning shift late after 07:05
    if (role === "Janitor") {
      return timeIn > "07:05";
    }
    // security late flag uses 05:05 check as per spec (example)
    if (role === "Security") {
      return timeIn > "05:05";
    }
    return false;
  }

  async function submitFor(uid) {
    if (adminPass !== "admin") {
      setMessage("Admin password required to submit.");
      return;
    }
    const att = attendanceMap[uid];
    if (!att) {
      setMessage("Enter attendance first.");
      return;
    }
    const path = `attendance/${date}/${facility.toLowerCase()}/${role.toLowerCase()}/${uid}`;
    try {
      await set(ref(db, path), { ...att, late: detectLate(att.timeIn) });
      setMessage("Attendance saved.");
    } catch (err) {
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
          <div>No staff assigned for this date and role.</div>
        ) : (
          assigned.map(uid => {
            const staff = staffMap[uid] || { name: uid, role };
            const att = attendanceMap[uid] || { timeIn: "", timeOut: "", breakIn: "", breakOut: "", present: true, absent: false, onLeave: false };
            return (
              <div key={uid} style={{ border: "1px solid #eee", padding: 12, marginBottom: 12, borderRadius: 8 }}>
                <div><b>{staff.name}</b> ({staff.role})</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <label>Time In: <input type="time" value={att.timeIn} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, timeIn: e.target.value } }))} /></label>
                  <label>Time Out: <input type="time" value={att.timeOut} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, timeOut: e.target.value } }))} /></label>
                  <label>Break In: <input type="time" value={att.breakIn} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, breakIn: e.target.value } }))} /></label>
                  <label>Break Out: <input type="time" value={att.breakOut} onChange={e => setAttendanceMap(m => ({ ...m, [uid]: { ...att, breakOut: e.target.value } }))} /></label>
                </