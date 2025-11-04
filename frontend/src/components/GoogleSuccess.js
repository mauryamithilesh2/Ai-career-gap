// frontend/src/components/GoogleSuccess.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      // Save tokens to localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Redirect to dashboard (or any protected page)
      navigate("/dashboard");
    } else {
      // If tokens missing, redirect to login
      navigate("/login?error=google_failed");
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg font-semibold">Signing you in with Google...</p>
    </div>
  );
}

export default GoogleSuccess;
