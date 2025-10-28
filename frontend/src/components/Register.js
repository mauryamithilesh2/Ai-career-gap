import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/api";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
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

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password) {
            setError('All fields are required');
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await authAPI.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.confirmPassword
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            // setError(err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.');
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

    if (success) {
        return (
            <div className="register-container">
                <div className="register-card">
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h2>Registration Successful!</h2>
                        <p>Your account has been created successfully. Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <div className="logo">
                        <span className="logo-icon">🎯</span>
                        <span className="logo-text">CareerGap</span>
                    </div>
                    <h1 className="register-title">Create Account</h1>
                    <p className="register-subtitle">Join us to start analyzing your career gap</p>
                </div>

                <form onSubmit={handleRegister} className="register-form">
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input type="checkbox" required />
                            <span className="checkmark"></span>
                            I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary register-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <span>🚀</span>
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="register-footer">
                    <p className="login-text">
                        Already have an account? 
                        <Link to="/login" className="login-link"> Sign in here</Link>
                    </p>
                </div>
            </div>

            <div className="register-background">
                <div className="background-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>
        </div>
    );
}


export default Register;