import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { authAPI } from '../api/api';

function Profile() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        const data = res.data;
        const userData = data.user || {};
        setProfile({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });
        
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 
                        'Unable to load profile. Please try again.';
        setError(errorMsg);
      }
    };
    fetchProfile();
  }, []);

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional in profile
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Check if it starts with + and has 10-15 digits, or just has 10-15 digits
    const phoneRegex = /^(\+?\d{1,3})?[\d]{10,15}$/;
    return phoneRegex.test(cleaned);
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate form
    if (!profile.first_name || profile.first_name.length < 2) {
      setError('First name must be at least 2 characters long');
      setLoading(false);
      return;
    }
    if (!profile.last_name || profile.last_name.length < 2) {
      setError('Last name must be at least 2 characters long');
      setLoading(false);
      return;
    }
    if (!profile.email) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (profile.phone && !validatePhone(profile.phone)) {
      setError('Please enter a valid phone number (e.g., +91 9876543210 or 9876543210)');
      setLoading(false);
      return;
    }

    try {
      // Update profile with user fields
      await authAPI.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
        bio: profile.bio || '',
      });

      // Fetch updated profile
      const userRes = await authAPI.getProfile();
      const userData = userRes.data.user || {};
      setProfile({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userRes.data.phone || '',
        bio: userRes.data.bio || '',
      });
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error ||
                      'Error updating profile. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">View and edit your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                  <p className="text-sm text-gray-600 mt-1">Your basic information</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors flex items-center space-x-2"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Profile updated successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={profile.first_name}
                        onChange={handleChange}
                        disabled={!editMode}
                        placeholder="Enter first name"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={profile.last_name}
                        onChange={handleChange}
                        disabled={!editMode}
                        placeholder="Enter last name"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        value={profile.username}
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={profile.email}
                        onChange={handleChange}
                        disabled={!editMode}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="e.g., +91 9876543210 or 9876543210"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter phone number with country code (optional)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                      placeholder="Tell us about yourself..."
                      value={profile.bio}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </div>

                  {editMode && (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Profile Tips</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Keep Contacts Updated</h4>
                    <p className="text-sm text-gray-600">Ensure your email and mobile number are current.</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Accurate Address</h4>
                    <p className="text-sm text-gray-600">Helps in location-based job recommendations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  onClick={() => navigate('/dashboard')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

export default Profile;
