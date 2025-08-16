import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Signup from "./signup";
import Dashboard from "./dashboard";
import AdminDashboard from "./adminDashboard";
import Bookings from "./bookings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="*" element={<Login />} /> {/* fallback to login */}
      </Routes>
    </Router>
  );
}
