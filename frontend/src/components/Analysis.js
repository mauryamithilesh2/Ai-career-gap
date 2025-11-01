// src/pages/Analyze.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { analyzeAPI, resumeAPI, jobAPI } from '../api/api';
import './Profile.css'; // reuse same clean styling

function Analyze() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch uploaded resumes and jobs
  useEffect(() => {
    async function fetchData() {
      try {
        const [resumeRes, jobRes] = await Promise.all([
          resumeAPI.list(),
          jobAPI.list(),
        ]);
        setResumes(resumeRes.data);
        setJobs(jobRes.data);
      } catch (err) {
        console.error('Data load error:', err);
        setError('⚠️ Unable to load resume or job data.');
      }
    }
    fetchData();
  }, []);

  // 🧠 Perform resume-job analysis
  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!selectedResume || !selectedJob) {
      setError('Please select both a Resume and a Job Description.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setResult(null);

    try {
      const res = await analyzeAPI.analyze({
        resume_id: selectedResume,
        job_id: selectedJob,
      });
      setResult(res.data);
      setSuccess(true);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.error || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dashboard>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Resume Analysis</h1>
          <p className="text-gray-600">
            Compare your uploaded resume with a job description to find your strengths and gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <div>
                  <h2 className="card-title">🔍 Analyze Resume & Job</h2>
                  <p className="card-subtitle">Select resume and job to start analysis</p>
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
              {success && (
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  Analysis completed successfully!
                </div>
              )}

              <form onSubmit={handleAnalyze} className="space-y-6">
                {/* Resume Select */}
                <div className="form-group">
                  <label className="form-label">Select Resume</label>
                  <select
                    className="form-input"
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                  >
                    <option value="">-- Choose a Resume --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.file.split('/').pop()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Select */}
                <div className="form-group">
                  <label className="form-label">Select Job Description</label>
                  <select
                    className="form-input"
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                  >
                    <option value="">-- Choose a Job --</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Analyzing...' : '🚀 Start Analysis'}
                </button>
              </form>

              {/* Result Section */}
              {result && (
                <div className="mt-8 bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-inner">
                  <h3 className="text-xl font-semibold text-green-700 mb-3 text-center">
                    Analysis Result
                  </h3>
                  <p className="text-gray-800 mb-2">
                    <strong>Match Score:</strong> {result.match_score || 0}%
                  </p>
                  <p className="text-gray-800 mb-2">
                    <strong>Strengths:</strong>{' '}
                    {(result.strengths || []).join(', ') || 'None listed'}
                  </p>
                  <p className="text-gray-800">
                    <strong>Missing Skills:</strong>{' '}
                    {(result.missing_skills || []).join(', ') || 'No major gaps! 🎯'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">💡 Analysis Tips</h3>
              </div>
              <div className="space-y-4">
                <div className="tip-item">
                  <div className="tip-icon">📄</div>
                  <div className="tip-content">
                    <h4>Keep Resume Updated</h4>
                    <p>Upload your latest version for better accuracy.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon">🏢</div>
                  <div className="tip-content">
                    <h4>Select Relevant Job</h4>
                    <p>Pick the job most aligned with your career goals.</p>
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
                  onClick={() => navigate('/upload-job')}
                >
                  📤 Upload Job
                </button>
                <button
                  className="btn btn-secondary w-full"
                  onClick={() => navigate('/upload-resume')}
                >
                  📎 Upload Resume
                </button>
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

export default Analyze;
