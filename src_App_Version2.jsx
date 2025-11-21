import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ShiftCalendar from "./pages/ShiftCalendar";
import AttendancePage from "./pages/AttendancePage";
import PDFReport from "./pages/PDFReport";
import AuthAdmin from "./pages/AuthAdmin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth-admin" element={<AuthAdmin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/shift-calendar" element={<ShiftCalendar />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/report" element={<PDFReport />} />
    </Routes>
  );
}