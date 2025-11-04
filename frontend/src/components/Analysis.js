// src/pages/Analyze.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { analyzeAPI, resumeAPI, jobAPI } from '../api/api';

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

        let resumesData = resumeRes.data || [];
        setJobs(jobRes.data || []);

        // ✅ Include latest uploaded resume instantly (from localStorage)
        const latest = localStorage.getItem("latest_resume");
        if (latest) {
          const parsed = JSON.parse(latest);
          const exists = resumesData.some((r) => r.id === parsed.id);
          if (!exists) {
            resumesData = [parsed, ...resumesData];
          }
          // Optional: clean up once added
          localStorage.removeItem("latest_resume");
        }

        setResumes(resumesData);
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 
                        err.response?.data?.error ||
                        'Unable to load resume or job data. Please try again.';
        setError(errorMsg);
      }
    }
    fetchData();
  }, []);



  //   useEffect(() => {
  //   if (resumes.length > 0) {
  //     setSelectedResume(resumes[0].id); // auto-select latest
  //   }
  // }, [resumes]);


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
      setError(''); // Clear any previous errors
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail ||
                      'Analysis failed. Please ensure both resume and job have valid text content.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h1>
          <p className="text-gray-600">
            Compare your uploaded resume with a job description to find your strengths and gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Analyze Resume & Job</h2>
                <p className="text-sm text-gray-600 mt-1">Select resume and job to start analysis</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Alerts */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                {success && !result && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Analysis completed successfully!</span>
                  </div>
                )}

                <form onSubmit={handleAnalyze} className="space-y-6">
                  {/* Resume Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Resume
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                      value={selectedResume}
                      onChange={(e) => setSelectedResume(e.target.value)}
                    >
                      <option value="">-- Choose a Resume --</option>
                      {resumes.length > 0 ? (
                        resumes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.file_name ? r.file_name : `Resume #${r.id}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No resumes uploaded yet
                        </option>
                      )}
                    </select>
                  </div>


                  {/* Job Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Job Description</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                      value={selectedJob}
                      onChange={(e) => setSelectedJob(e.target.value)}
                    >
                      <option value="">-- Choose a Job --</option>
                      {jobs.length > 0 ? (
                        jobs.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.title || `Job #${j.id}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No job descriptions uploaded yet</option>
                      )}
                    </select>
                  </div>

                  {/* Submit Button */}
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
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Start Analysis</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Result Section */}
                {result && result.match_percent !== undefined && (
                  <div className="mt-8 space-y-6">
                    {/* Match Percentage Card */}
                    <div className="bg-primary-500 rounded-lg shadow-lg p-8">
                      <div className="text-center">
                        <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-gray-700">
                          Overall Match Score
                        </h3>
                        <div className="text-6xl font-bold mb-4 text-gray-900">
                          {result.match_percent || result.match_score || 0}%
                        </div>
                        <div className="w-full bg-white bg-opacity-50 rounded-full h-3 mb-4">
                          <div
                            className="bg-gray-900 rounded-full h-3 transition-all duration-500"
                            style={{
                              width: `${result.match_percent || result.match_score || 0}%`
                            }}
                          />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {(result.match_percent || result.match_score || 0) >= 80
                            ? 'Excellent Match'
                            : (result.match_percent || result.match_score || 0) >= 60
                            ? 'Good Match'
                            : (result.match_percent || result.match_score || 0) >= 40
                            ? 'Fair Match - Some improvements needed'
                            : 'Needs Significant Improvement'}
                        </p>
                      </div>
                    </div>

                    {/* Skills Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Resume Skills */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Your Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.resume_skills && result.resume_skills.length > 0 ? (
                            result.resume_skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-primary-50 text-gray-900 rounded-full text-sm font-medium border border-primary-200"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-600 text-sm italic">No skills detected in resume. Ensure your resume mentions technical skills clearly.</p>
                          )}
                        </div>
                      </div>

                      {/* Job Required Skills */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Job Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.job_skills && result.job_skills.length > 0 ? (
                            result.job_skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium border border-gray-200"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-600 text-sm italic">No skills detected in job description. Please add more detailed skill requirements.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {result.missing_skills && result.missing_skills.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.missing_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-medium border border-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Learning Recommendations
                        </h4>
                        <ul className="space-y-3">
                          {result.recommendations.map((rec, idx) => (
                            <li
                              key={idx}
                              className="text-gray-700 text-sm flex items-start gap-3"
                            >
                              <span className="text-primary-600 mt-1 font-bold">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Resume Overview */}
                    {result.resume_overview && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Resume Overview
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Experience:</span>
                            <span className="ml-2 font-semibold text-gray-900">
                              {result.resume_overview.has_experience ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Education:</span>
                            <span className="ml-2 font-semibold text-gray-900">
                              {result.resume_overview.has_education ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Years of Experience:</span>
                            <span className="ml-2 font-semibold text-gray-900">
                              {result.resume_overview.year_experience || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Analysis Tips</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Keep Resume Updated</h4>
                    <p className="text-sm text-gray-600">Upload your latest version for better accuracy.</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Select Relevant Job</h4>
                    <p className="text-sm text-gray-600">Pick the job most aligned with your career goals.</p>
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
                  onClick={() => navigate('/upload-job')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Upload Job</span>
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  onClick={() => navigate('/upload-resume')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Upload Resume</span>
                </button>
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

export default Analyze;
