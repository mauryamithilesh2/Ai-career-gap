// frontend/src/components/GoogleSuccess.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/api";

function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const access = params.get("access");
      const refresh = params.get("refresh");

      if (access && refresh) {
        // Save tokens to localStorage (using correct keys)
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        try {
          // Fetch user profile and store it
          const res = await authAPI.getProfile();
          const userData = res.data.user || {};
          localStorage.setItem("user", JSON.stringify(userData));
          
          // Redirect to dashboard
          navigate("/dashboard");
        } catch (err) {
          console.error("Error fetching user profile:", err);
          // Still redirect to dashboard even if profile fetch fails
          navigate("/dashboard");
        }
      } else {
        // If tokens missing, redirect to login
        navigate("/login?error=google_failed");
      }
    };

    handleGoogleLogin();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg font-semibold">Signing you in with Google...</p>
    </div>
  );
}

export default GoogleSuccess;
