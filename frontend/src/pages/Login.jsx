import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import instance from "../api/axios";
import { useAuth } from "../context/useAuth";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
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
      const res = await instance.post("/auth/login", { email, password });
      const { user, token } = res.data;
      login(user, token);
      navigate("/dashboard"); //ek route se dusre route par jane ke liye
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
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
          <p className="subtitle ">Sign in to your account</p>
        </div>

        {/* Error */}
        {message && <p className="form-error">{message}</p>}
        {error && <div className="error">{error}</div>}

        {/* Inputs */}
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
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Link to Signup */}
        <p className="linkText">
          Don't have an account?{" "}
          <Link to="/signup" className="link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
