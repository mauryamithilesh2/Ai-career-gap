// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 🧠 Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile({
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          address: data.address || '',
        });
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Unable to load profile. Please try again.');
      }
    };
    fetchProfile();
  }, []);

  // 🖊 Handle text field changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 💾 Save updated profile
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PATCH', // ✅ use PATCH instead of PUT to update partial fields
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          name: profile.name,
          mobile: profile.mobile,
          address: profile.address,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error('Update error:', msg);
        throw new Error('Update failed');
      }

      const data = await res.json();
      setProfile({
        ...profile,
        name: data.name || profile.name,
        mobile: data.mobile || profile.mobile,
        address: data.address || profile.address,
      });
      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dashboard>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 Profile</h1>
          <p className="text-gray-600">View and edit your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <div>
                  <h2 className="card-title">🧾 Personal Details</h2>
                  <p className="card-subtitle">Your basic information</p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
              {success && (
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      className="form-input"
                      placeholder="e.g. +91 9876543210"
                      value={profile.mobile}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-input"
                      placeholder="e.g. Mumbai, India"
                      value={profile.address}
                      onChange={handleChange}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                {editMode && (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">💡 Profile Tips</h3>
              </div>
              <div className="space-y-4">
                <div className="tip-item">
                  <div className="tip-icon">📞</div>
                  <div className="tip-content">
                    <h4>Keep Contacts Updated</h4>
                    <p>Ensure your email and mobile number are current.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">📍</div>
                  <div className="tip-content">
                    <h4>Accurate Address</h4>
                    <p>Helps in location-based job recommendations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">⚡ Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <button
                  className="btn btn-secondary w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  🏠 Return to Dashboard
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
