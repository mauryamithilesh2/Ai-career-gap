// src/pages/GoogleCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const access = url.searchParams.get("access");
    const refresh = url.searchParams.get("refresh");
    const error = url.searchParams.get("error");

    if (error) {
      navigate("/login?error=" + error);
      return;
    }

    if (access && refresh) {
      console.log("✅ Tokens found:", { access, refresh });
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      setTimeout(() => {
    navigate("/dashboard");
    }, 300);

    } else {
      console.warn("❌ No tokens found in URL:", window.location.href);
      navigate("/login?error=missing_tokens");
    }
  }, [navigate]);

  return <div className="flex items-center justify-center h-screen">Logging in…</div>;
}

export default GoogleCallback;
