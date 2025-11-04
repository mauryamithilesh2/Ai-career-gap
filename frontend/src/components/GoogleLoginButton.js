import React from "react";

const GOOGLE_LOGIN_URL = 
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/api/auth/google/login/"
    : "https://ai-career-gap.onrender.com/api/auth/google/login/";

function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL; // Redirect to backend
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
    >
      Continue with Google
    </button>
  );
}

export default GoogleLoginButton;
