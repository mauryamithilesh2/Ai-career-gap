import React, { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../api/api';
import Dashboard from './Dashboard';


function UploadJob() {
  
  const [, setJobs] = useState([]);
  
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: 'full-time'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const [selectedJobId, setSelectedJobId] = useState('');
  
  
 useEffect(() => {
   const fetchJobs = async () => {
     try {
       const res = await jobAPI.list();
       setJobs(res.data);
     } catch (err) {
       console.error("Error fetching jobs:", err);
     }
   };
   fetchJobs();
 }, []);
 

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

const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await jobAPI.update(selectedJobId, formData); // ← update existing job
      const updatedJobs = await jobAPI.list(); // refresh list
      setJobs(updatedJobs.data);
      setSuccess(true);
      setSelectedJobId(""); // reset to upload mode
      alert("Job updated successfully!");
    } catch (err) {
      console.error("Error updating job:", err);
      setError("Failed to update job.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dashboard>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Job Posted Successfully
            </h2>
            <p className="text-gray-600 mb-8">
              Your job posting has been uploaded and is ready for analysis.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Return to Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    title: '',
                    description: '',
                    company: '',
                    location: '',
                    requirements: '',
                    salary: '',
                    type: 'full-time'
                  });
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload Another Job</span>
              </button>
            </div>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Job</h1>
          <p className="text-gray-600">Post a job description for career gap analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Job Information</h2>
                <p className="text-sm text-gray-600 mt-1">Enter the job details for analysis</p>
              </div>

              <form onSubmit={selectedJobId ? handleUpdate : handleUpload} className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      name="type"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salary"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="e.g.,  Rs 20,000 - 120,000"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description &&  Key Requirements<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    className="w-full h-32 px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all "
                    placeholder="Enter job description or copy tech stack from job protal (skills,responsibilities, requirements, and qualifications... "
                    value={formData.description}
                    onChange={handleChange}
                    rows="8"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.description.length}/500 characters minimum
                  </p>
                </div>

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Key Requirements
                  </label>
                  <textarea
                    name="requirements"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                    placeholder="List key skills, qualifications, and requirements..."
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="4"
                  />
                </div> */}

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
                      <span>Uploading Job...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Job</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Writing Tips</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Be Specific</h4>
                    <p className="text-sm text-gray-600">Include specific technologies, tools, and methodologies.</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Clear Requirements</h4>
                    <p className="text-sm text-gray-600">List both required and preferred qualifications.</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Quantify When Possible</h4>
                    <p className="text-sm text-gray-600">Include years of experience and specific metrics.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Preview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Analysis Preview</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <span className="text-sm font-semibold text-gray-900">Skills Analysis</span>
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-primary-200">Technical & Soft Skills</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Experience Match</span>
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">Years & Level</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <span className="text-sm font-semibold text-gray-900">Gap Identification</span>
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-primary-200">Missing Skills</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">Recommendations</span>
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">Learning Path</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  onClick={() => navigate('/upload-resume')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Upload Resume Instead</span>
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  onClick={() => navigate('/analysis')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>View Previous Analysis</span>
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

export default UploadJob;
