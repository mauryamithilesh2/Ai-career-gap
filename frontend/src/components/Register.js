import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/api";
import Footer from "./Footer";

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

   const validatePhone = (phone) => {
  if (!phone) return true; // optional field
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s-()]/g, '');
  // Allow +country-code or plain numbers, 10–15 digits total
  const phoneRegex = /^(\+?\d{1,3})?\d{10,15}$/;
  return phoneRegex.test(cleaned);
};


    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.first_name || 
            !formData.last_name || !formData.phone || !formData.password) {
            setError('All fields are required');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters long');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!validatePhone(formData.phone)) {
            setError('Please enter a valid phone number (e.g., +91 9876543210 or 9876543210)');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.first_name.length < 2) {
            setError('First name must be at least 2 characters long');
            return false;
        }
        if (formData.last_name.length < 2) {
            setError('Last name must be at least 2 characters long');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;

        setLoading(true);
        try {
            await authAPI.register({
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                password: formData.password,
                password_confirm: formData.confirmPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const data = err.response?.data;
            if (data?.username) setError(data.username[0]);
            else if (data?.email) setError(data.email[0]);
            else if (data?.password) setError(data.password[0]);
            else if (data?.non_field_errors) setError(data.non_field_errors[0]);
            else if (typeof data === 'string') setError(data);
            else setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Success message card
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-gray-50 flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md px-8 py-10 text-center">
                    <svg
                        className="w-16 h-16 mx-auto text-green-500 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Your account has been created successfully. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-gray-50 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Register Card */}
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
                                <span className="text-2xl font-bold text-gray-900">CareerGap</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                            <p className="text-sm text-gray-700 mt-1">
                                Join us to start analyzing your career gap
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegister} className="px-8 py-8 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
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
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="Enter first name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        minLength={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="Enter last name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        minLength={2}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="e.g., +91 9876543210 or 9876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter phone number with country code (e.g., +91 9876543210)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Create a password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="flex items-start">
                                <label className="flex items-center space-x-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        required
                                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span>
                                        I agree to the{" "}
                                        <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-semibold">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold">
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
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
                                        <span>Creating Account...</span>
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
                                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                                            />
                                        </svg>
                                        <span>Create Account</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-primary-600 hover:text-primary-700"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Footer */}
            <Footer />
        </div>
    );
}

export default Register;
