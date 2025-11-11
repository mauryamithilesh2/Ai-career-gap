import React, { useState } from 'react';
import { resumeGenAPI } from '../api/api';
import Dashboard from './Dashboard';

function ResumeGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    education: '',
    skills: '',
    projects: '',
    internship: '',
    achievements: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumePreview, setResumePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const steps = [
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Professional', icon: '💼' },
    { id: 3, title: 'Experience', icon: '🎯' },
    { id: 4, title: 'Review', icon: '✨' },
  ];

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.role.trim()) errors.role = 'Role is required';
    }
    
    if (step === 2) {
      if (!formData.education.trim()) errors.education = 'Education is required';
      if (!formData.skills.trim()) errors.skills = 'Skills are required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      projects: formData.projects ? formData.projects.split(',').map(p => p.trim()).filter(p => p) : [],
      achievements: formData.achievements ? formData.achievements.split(',').map(a => a.trim()).filter(a => a) : [],
    };

    try {
      const res = await resumeGenAPI.generate(payload);
      setResumePreview(res.data.formatted_resume);
      setCurrentStep(4);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      err.message || 
                      "Failed to generate resume. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resumePreview) return;
    
    const blob = new Blob([resumePreview], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name || 'resume'}_resume.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    if (!resumePreview) return;
    try {
      await navigator.clipboard.writeText(resumePreview);
      // You could add a toast notification here
      alert('Resume copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      role: '',
      education: '',
      skills: '',
      projects: '',
      internship: '',
      achievements: '',
    });
    setResumePreview(null);
    setCurrentStep(1);
    setError('');
    setFormErrors({});
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-2">
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Mithilesh "
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Desired Role / Position <span className="text-red-500">*</span>
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g., Full Stack developer / software developer"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    formErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">💡 Tip: Be specific about the role you're targeting</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-2">
                <span className="text-2xl">💼</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Details</h2>
              <p className="text-gray-600">Tell us about your education and skills</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="education" className="block text-sm font-semibold text-gray-700 mb-2">
                  Education <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Bachelor of Technology, Institute Name, 2022-2026"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
                    formErrors.education ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.education && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.education}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">💡 Include degree, institution, and graduation year</p>
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g., JavaScript, React, Python, react.js, SQL, Git, Docker"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
                    formErrors.skills ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.skills && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.skills}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">💡 List your technical and soft skills</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-2">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Experience & Achievements</h2>
              <p className="text-gray-600">Showcase your projects and accomplishments</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="projects" className="block text-sm font-semibold text-gray-700 mb-2">
                  Projects
                </label>
                <textarea
                  id="projects"
                  name="projects"
                  value={formData.projects}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g., E-commerce Platform, Task Management App, Data Analysis Dashboard (comma separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">💡 Separate multiple projects with commas</p>
              </div>

              <div>
                <label htmlFor="internship" className="block text-sm font-semibold text-gray-700 mb-2">
                  Internship / Work Experience
                </label>
                <textarea
                  id="internship"
                  name="internship"
                  value={formData.internship}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Software Engineering Intern at Tech Company, Summer 2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">💡 Optional: Describe your work experience or internships</p>
              </div>

              <div>
                <label htmlFor="achievements" className="block text-sm font-semibold text-gray-700 mb-2">
                  Achievements & Awards
                </label>
                <textarea
                  id="achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g., Hackathon Winner 2023, Published Research Paper, Open Source Contributor (comma separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">💡 Highlight your notable achievements and recognitions</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-2">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Generate</h2>
              <p className="text-gray-600">Review your information before generating</p>
            </div>

            {!resumePreview ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Name</h3>
                    <p className="text-gray-900">{formData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Role</h3>
                    <p className="text-gray-900">{formData.role || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Education</h3>
                    <p className="text-gray-900">{formData.education || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Skills</h3>
                    <p className="text-gray-900">{formData.skills || 'Not provided'}</p>
                  </div>
                  {formData.projects && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">Projects</h3>
                      <p className="text-gray-900">{formData.projects}</p>
                    </div>
                  )}
                  {formData.internship && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">Experience</h3>
                      <p className="text-gray-900">{formData.internship}</p>
                    </div>
                  )}
                  {formData.achievements && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">Achievements</h3>
                      <p className="text-gray-900">{formData.achievements}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating Resume...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Generated Resume</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </span>
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download</span>
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                      {resumePreview}
                    </pre>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Create New Resume
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Edit Information
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dashboard>
      <div className="max-w-5xl mx-auto p-4 sm:p-5">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            AI Resume Generator
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Create a professional, ATS-friendly resume in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => {
                      if (step.id < currentStep || (step.id === currentStep && validateStep(step.id))) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      currentStep === step.id
                        ? 'bg-primary-500 text-gray-900 scale-110'
                        : currentStep > step.id
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    disabled={step.id > currentStep}
                  >
                    {step.id < currentStep ? '✓' : step.icon}
                  </button>
                  <span className={`mt-2 text-xs font-medium hidden sm:block ${
                    currentStep === step.id ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 sm:mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2" role="alert">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </span>
            </button>

            <button
              onClick={currentStep === 3 ? handleGenerate : handleNext}
              disabled={loading}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="flex items-center space-x-2">
                <span>{currentStep === 3 ? 'Generate Resume' : 'Next'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        )}
      </div>
    </Dashboard>
  );
}

export default ResumeGenerator;
