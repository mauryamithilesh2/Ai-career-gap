import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../api/api";
import Dashboard from "./Dashboard";

function UploadResume() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const navigate = useNavigate();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const validateFile = (file) => {
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            setError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
            return false;
        }

        if (file.size > maxSize) {
            setError("File size must be less than 5MB");
            return false;
        }

        setError("");
        return true;
    };

   const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
        setError("Please select a file first.");
        return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await resumeAPI.upload(formData);

        // ✅ Save the uploaded resume temporarily for instant analysis dropdown
        if (response?.data?.data) {
            localStorage.setItem("latest_resume", JSON.stringify(response.data.data));
        }

        setSuccess(true);
    } catch (error) {
        const errorMessage =
            error.response?.data?.detail ||
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to upload resume. Please try again.";
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};


    const removeFile = () => {
        setFile(null);
        setError("");
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
                            Resume Uploaded Successfully
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Your resume has been uploaded and is ready for analysis.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate("/analysis")}
                                className="w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Analyze Resume with Job</span>
                            </button>
                            <button
                                onClick={() => navigate("/upload-job")}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Upload Job Description</span>
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Return to Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Dashboard>
        );
    }

    return (
        <Dashboard>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h1>
                    <p className="text-gray-600">Upload your resume to start the career gap analysis</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Upload Section */}
                    <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Resume Upload</h2>
                            <p className="text-sm text-gray-600 mt-1">Select your resume file to get started</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div
                                className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all relative min-h-[200px] flex items-center justify-center ${
                                    dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                                } ${file ? 'border-primary-500 bg-primary-50' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    id="file-upload"
                                />
                                {file ? (
                                    <div className="space-y-4 w-full">
                                        <div className="w-16 h-16 mx-auto bg-primary-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{file.name}</h3>
                                            <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="text-sm text-primary-600 hover:text-primary-800 font-medium underline"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 w-full">
                                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-base mb-1">Drop your resume here</h3>
                                            <p className="text-sm text-gray-600 mb-2">or click to browse files</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
                                <div className="flex items-center space-x-4">
                                    <span>• PDF (.pdf)</span>
                                    <span>• Word (.doc, .docx)</span>
                                </div>
                                <span>Max 5MB</span>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className={`w-full bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                                    !file || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-sm">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-sm">Upload Resume</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Tips</h2>
                            <p className="text-sm text-gray-600 mt-1">Quick guidelines</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex space-x-3">
                                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 font-bold text-sm">1</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Format</h3>
                                    <p className="text-xs text-gray-600">Use PDF or Word format</p>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 font-bold text-sm">2</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Include Details</h3>
                                    <p className="text-xs text-gray-600">Experience, skills & education</p>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 font-bold text-sm">3</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Keep Updated</h3>
                                    <p className="text-xs text-gray-600">Upload your latest version</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dashboard>
    );
}

export default UploadResume;
