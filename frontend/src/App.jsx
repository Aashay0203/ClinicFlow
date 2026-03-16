import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup";
import DoctorSignup from "./pages/DoctorSignUp";
import DoctorList from "./pages/DoctorList";
import SlotSelection from "./pages/AppointmentBook";
import Payment from "./pages/Payment.jsx";
import MyAppointment from "./pages/MyAppointment.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/doctorSignup" element={<DoctorSignup />} />
          <Route path="/doctorList" element={<DoctorList />} />
          <Route path="/booking/:doctorId" element={<SlotSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/my-appointments" element={<MyAppointment />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
