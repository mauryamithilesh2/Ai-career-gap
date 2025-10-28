import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/api";
import "./Login.css";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', { username, password: '***' });
            const res = await authAPI.login({ username, password });
            console.log('Login response:', res.data);
            
            localStorage.setItem('access_token', res.data.tokens.access);
            localStorage.setItem('refresh_token', res.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user));           
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error response:', err.response?.data);
            
            const backendError =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.response?.data?.non_field_errors?.[0] ||
            err.response?.data?.errors ||
            'Login failed. Please check your credentials.';

            setError(backendError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">
                        <span className="logo-icon">🎯</span>
                        <span className="logo-text">CareerGap</span>
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
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
                            className="form-input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <button type="button" className="forgot-password" onClick={() => navigate('/forgot-password')}>
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary login-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <span>🔐</span>
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="signup-text">
                        Don't have an account? 
                        <Link to="/register" className="signup-link"> Create one here</Link>
                    </p>
                </div>
            </div>

            <div className="login-background">
                <div className="background-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>
        </div>
    );
}


export default Login;