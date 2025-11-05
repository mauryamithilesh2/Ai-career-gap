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
      className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg  transition-colors border border-gray-400 shadow-md"
    >
      <img 
src="https://developers.google.com/identity/images/g-logo.png"    alt="Google" 
    className="w-5 h-5 inline-block mr-2 my-auto"
  />
      Continue with Google
    </button>
  );
}

export default GoogleLoginButton;
