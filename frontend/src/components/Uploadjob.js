import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../api/api';
import Dashboard from './Dashboard';

function UploadJob() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    requirements: '',
    salary: '',
    type: 'full-time'
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
    if (!formData.title.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Job description is required');
      return false;
    }
    if (formData.description.length < 50) {
      setError('Job description must be at least 50 characters long');
      return false;
    }
    setError('');
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await jobAPI.upload(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dashboard>
        <div className="fade-in">
          <div className="card">
            <div className="success-message text-center">
              <div className="success-icon text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Job Posted Successfully!</h2>
              <p className="text-gray-600">Your job posting has been uploaded and is ready for analysis.</p>
            </div>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Job</h1>
          <p className="text-gray-600">Post a job description for career gap analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">💼 Job Information</h2>
                <p className="card-subtitle">Enter the job details for analysis</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      name="company"
                      className="form-input"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select
                      name="type"
                      className="form-input"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    className="form-input"
                    placeholder="e.g., $80,000 - $120,000"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea
                    name="description"
                    className="form-input form-textarea"
                    placeholder="Provide a detailed job description including responsibilities, requirements, and qualifications..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="8"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/500 characters minimum
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Requirements</label>
                  <textarea
                    name="requirements"
                    className="form-input form-textarea"
                    placeholder="List key skills, qualifications, and requirements..."
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Uploading Job...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Upload Job
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">💡 Writing Tips</h3>
              </div>
              <div className="space-y-4">
                <div className="tip-item">
                  <div className="tip-icon">📝</div>
                  <div className="tip-content">
                    <h4>Be Specific</h4>
                    <p>Include specific technologies, tools, and methodologies.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🎯</div>
                  <div className="tip-content">
                    <h4>Clear Requirements</h4>
                    <p>List both required and preferred qualifications.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">📊</div>
                  <div className="tip-content">
                    <h4>Quantify When Possible</h4>
                    <p>Include years of experience and specific metrics.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Preview */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📊 Analysis Preview</h3>
              </div>
              <div className="space-y-3">
                <div className="preview-item">
                  <span className="preview-label">Skills Analysis</span>
                  <span className="preview-value">Technical & Soft Skills</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Experience Match</span>
                  <span className="preview-value">Years & Level</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Gap Identification</span>
                  <span className="preview-value">Missing Skills</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Recommendations</span>
                  <span className="preview-value">Learning Path</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">⚡ Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <button className="btn btn-secondary w-full">
                  📄 Upload Resume Instead
                </button>
                <button className="btn btn-secondary w-full">
                  📊 View Previous Analysis
                </button>
                <button className="btn btn-secondary w-full">
                  💾 Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
    </Dashboard>
  );
}

export default UploadJob;
