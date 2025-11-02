import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/api";

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
            const res = await authAPI.login({ username, password });
            
            localStorage.setItem('access_token', res.data.tokens.access);
            localStorage.setItem('refresh_token', res.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user));           
            navigate('/dashboard');
        } catch (err) {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-gray-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary-500 px-8 py-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">CareerGap</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-sm text-gray-700 mt-1">Sign in to your account to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="px-8 py-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500" />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Forgot password?
                            </button>
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
                                    <svg className="animate-spin h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
