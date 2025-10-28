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
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
            return false;
        }

        if (file.size > maxSize) {
            setError('File size must be less than 5MB');
            return false;
        }

        setError('');
        return true;
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await resumeAPI.upload(formData);
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

    const removeFile = () => {
        setFile(null);
        setError('');
    };

    if (success) {
        return (
            <Dashboard>
                <div className="fade-in">
                    <div className="card">
                        <div className="success-message text-center">
                            <div className="success-icon text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">Resume Uploaded Successfully!</h2>
                            <p className="text-gray-600">Your resume has been processed and is ready for analysis.</p>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h1>
                    <p className="text-gray-600">Upload your resume to start the career gap analysis</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📄 Resume Upload</h2>
                            <p className="card-subtitle">Select your resume file to get started</p>
                        </div>

                        {error && (
                            <div className="error-message mb-4">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div
                            className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="file-preview">
                                    <div className="file-icon">📄</div>
                                    <div className="file-info">
                                        <h3 className="file-name">{file.name}</h3>
                                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button onClick={removeFile} className="remove-file-btn">
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="upload-placeholder">
                                    <div className="upload-icon">📁</div>
                                    <h3 className="upload-title">Drop your resume here</h3>
                                    <p className="upload-subtitle">or click to browse files</p>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                        className="file-input"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="upload-info">
                            <h4 className="info-title">Supported formats:</h4>
                            <ul className="info-list">
                                <li>PDF (.pdf)</li>
                                <li>Microsoft Word (.doc, .docx)</li>
                            </ul>
                            <p className="info-note">Maximum file size: 5MB</p>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <span>🚀</span>
                                    Upload Resume
                                </>
                            )}
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📋 Instructions</h2>
                            <p className="card-subtitle">How to prepare your resume</p>
                        </div>

                        <div className="instructions">
                            <div className="instruction-item">
                                <div className="instruction-icon">1️⃣</div>
                                <div className="instruction-content">
                                    <h3>Format Your Resume</h3>
                                    <p>Ensure your resume is in PDF or Word format for best results.</p>
                                </div>
                            </div>

                            <div className="instruction-item">
                                <div className="instruction-icon">2️⃣</div>
                                <div className="instruction-content">
                                    <h3>Include Key Information</h3>
                                    <p>Make sure your resume includes work experience, skills, and education.</p>
                                </div>
                            </div>

                            <div className="instruction-item">
                                <div className="instruction-icon">3️⃣</div>
                                <div className="instruction-content">
                                    <h3>Keep It Updated</h3>
                                    <p>Upload your most recent resume for accurate analysis results.</p>
                                </div>
                            </div>
                        </div>

                        <div className="tips-section">
                            <h3 className="tips-title">💡 Pro Tips</h3>
                            <ul className="tips-list">
                                <li>Use clear section headings</li>
                                <li>Include relevant keywords</li>
                                <li>Quantify your achievements</li>
                                <li>Keep formatting consistent</li>
                            </ul>
                        </div>
                    </div>
                </div>
    </div>
        </Dashboard>
  );
}

export default UploadResume;