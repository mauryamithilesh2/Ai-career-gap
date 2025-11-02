import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await API.post("auth/password-reset/", { email });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary-500 px-8 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                CareerGap
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              Enter your registered email and we’ll send a reset link
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {message && (
              <div
                className={`px-4 py-3 rounded-lg text-sm flex items-center space-x-2 ${
                  message.startsWith("✅")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      message.startsWith("✅")
                        ? "M5 13l4 4L19 7"
                        : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    }
                  />
                </svg>
                <span>{message}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-gray-900"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12H8m0 0l4-4m-4 4l4 4"
                    />
                  </svg>
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Remembered your password?{" "}
              <Link
                to="/"
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
