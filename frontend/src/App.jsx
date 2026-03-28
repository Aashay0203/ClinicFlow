import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { Box, CircularProgress } from "@mui/material";

const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup"));
const DoctorSignup = lazy(() => import("./pages/DoctorSignUp"));
const DoctorList = lazy(() => import("./pages/DoctorList"));
const SlotSelection = lazy(() => import("./pages/AppointmentBook"));
const Payment = lazy(() => import("./pages/Payment.jsx"));
const MyAppointment = lazy(() => import("./pages/MyAppointment.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Report = lazy(() => import("./pages/Report.jsx"));
const ReportUpload = lazy(() => import("./pages/ReportUpload.jsx"));
const ReportDetails = lazy(() => import("./pages/ReportDetails.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const HealthProfileSetup = lazy(
  () => import("./pages/HealthProfileSetup/HealthProfileSetup.jsx"),
);
const HealthProfile = lazy(
  () => import("./pages/HealthProfile/HealthProfile.jsx"),
);

function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        bgcolor: "#e8ecee",
      }}
    >
      <CircularProgress sx={{ color: "#3e7df5" }} />
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/reports" element={<Report />} />
            <Route path="/reports/upload" element={<ReportUpload />} />
            <Route path="/reports/:id" element={<ReportDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/health-profile" element={<HealthProfile />} />
            <Route
              path="/health-profile/setup"
              element={<HealthProfileSetup />}
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
