import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import instance from "../api/axios";
import "./Login.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const message = location.state?.message;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await instance.post("/auth/signup", {
        email,
        phone,
        password,
        name,
      });
      const { token, user } = res.data;
      login(user, token);
      navigate("/doctorList"); //ek route se dusre route par jane ke liye
    } catch (err) {
      setError(err.response?.data?.message || "SignUp Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {message && <p className="form-error">{message}</p>}
      <div className="card">
        {/* Header */}
        <div className="header">
          <div className="logo">🏥</div>
          <h1 className="title">DelhiMed</h1>
          <p className="subtitle ">Sign up to your account</p>
        </div>

        {/* Error */}
        {message && <p className="form-error">{message}</p>}
        {error && <div className="error">{error}</div>}

        {/* Inputs */}
        <div className="inputGroup">
          <label className="label">Name</label>
          <input
            className="input"
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="inputGroup">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="inputGroup">
          <label className="label">Contact:</label>
          <input
            className="input"
            type="tel"
            placeholder="Enter Your Contact Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="inputGroup">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Link to Signup */}
        <p className="linkText">
          Have an account?{" "}
          <Link to="/login" className="link">
            Sign In
          </Link>
        </p>
        {/* Link to Doctor Signup */}
        <p className="linkText">
          Are you a Doctor?{" "}
          <Link to="/doctorSignup" className="link">
            Sign Up Here
          </Link>
        </p>
      </div>
    </div>
  );
}
