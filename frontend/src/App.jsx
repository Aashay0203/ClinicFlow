import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup";
import DoctorSignup from "./pages/DoctorSignUp";
import DoctorList from "./pages/DoctorList";

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
