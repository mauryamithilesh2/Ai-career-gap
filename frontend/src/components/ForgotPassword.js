import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("auth/password-reset/", { email });
      setMessage("✅ Password reset link has been sent to your email.");
    } catch (error) {
      setMessage(
        "❌ " +
          (error.response?.data?.detail ||
            error.response?.data?.error ||
            "Something went wrong. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-header">
          <div className="logo">
            <span className="logo-icon"></span>
            <span className="logo-text">CareerGap</span>
          </div>
          <h1 className="forgot-title">Forgot Password</h1>
          <p className="forgot-subtitle">
            Enter your registered email and we’ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-form">
          {message && (
            <div
              className={`message-box ${
                message.startsWith("✅") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`forgot-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Sending Link...
              </>
            ) : (
              <>
                <span>📩</span> Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="forgot-footer">
          <p className="back-text">
            Remembered your password?
            <Link to="/" className="back-link">
              {" "}
              Back to Login
            </Link>
          </p>
        </div>
      </div>

      <div className="forgot-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
