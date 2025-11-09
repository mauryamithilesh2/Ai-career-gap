import React, { useState } from "react";

const GOOGLE_LOGIN_URL = 
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/api/auth/google/login/"
    : "https://ai-career-gap.onrender.com/api/auth/google/login/";

function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const res = await fetch(GOOGLE_LOGIN_URL, { method: "GET" });

      // If backend is awake → redirect
      if (res.ok || res.status === 302) {
        window.location.href = GOOGLE_LOGIN_URL;
      } else {
        throw new Error("Server not ready");
      }

    } catch (error) {
      setLoading(false);
      alert(
        "⏳ The server is waking up(free version)... Please try again later.\n\n or Please login manually... "
      );
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg border border-gray-400 shadow-md transition-colors"
    >
      
          <img 
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5 inline-block mr-2 my-auto"
          />
          Continue with Google
    </button>
  );
}

export default GoogleLoginButton;
