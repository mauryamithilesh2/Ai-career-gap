import React, { useState, useRef, useEffect } from "react";
import Dashboard from "./Dashboard";
import { speakAPI } from "../api/api";

function SpeakAssessment() {
    const [audio, setAudio] = useState(null);
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);

    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioRef = useRef(null);

    // Elapsed time in seconds
    const [elapsed, setElapsed] = useState(0);
    const elapsedIntervalRef = useRef(null);

    // Audio visualization
    const [audioLevels, setAudioLevels] = useState([]);
    const animationFrameRef = useRef(null);
    const analyserRef = useRef(null);

    useEffect(() => {
        return () => {
            if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            cleanupMedia();
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudio(file);
            setAudioBlob(null);
            setResult(null);
            setError('');
            
            // Create preview URL
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
        }
    };

    const analyzeSpeech = async () => {
        if (!audio && !audioBlob) {
            setError("Please record or upload an audio file first.");
            return;
        }

        const formData = new FormData();
        
        // Use uploaded file if available, otherwise use recorded audio
        if (audio && audio instanceof File) {
            formData.append("audio", audio);
        } else if (audioBlob) {
            const audioFile = new File([audioBlob], "speech.webm", { type: "audio/webm" });
            formData.append("audio", audioFile);
        } else if (audio && audio instanceof Blob) {
            const audioFile = new File([audio], "speech.webm", { type: "audio/webm" });
            formData.append("audio", audioFile);
        }

        setLoading(true);
        setResult(null);
        setError('');
        
        try {
            const res = await speakAPI.analyze(formData);
            setResult(res.data);
        } catch (err) {
            console.error("Analysis error:", err);
            const errorMessage = err.response?.data?.error || 
                                err.response?.data?.detail || 
                                err.message || 
                                "Analysis failed. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // Set up audio visualization
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const recorder = new MediaRecorder(stream);
            let chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setAudioBlob(blob);
                setAudio(blob);
                
                // Create preview URL
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                
                chunks = [];
                audioContext.close();
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setRecording(true);
            setElapsed(0);
            setResult(null);
            setError('');

            // Start elapsed timer
            elapsedIntervalRef.current = setInterval(() => {
                setElapsed((s) => s + 1);
            }, 1000);

            // Start audio visualization
            const visualize = () => {
                if (!recording) return;
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyser.getByteFrequencyData(dataArray);
                
                // Sample data for visualization (take every 4th value for performance)
                const sampled = [];
                for (let i = 0; i < bufferLength; i += 4) {
                    sampled.push(dataArray[i]);
                }
                setAudioLevels(sampled);
                
                animationFrameRef.current = requestAnimationFrame(visualize);
            };
            visualize();

        } catch (err) {
            console.error("Microphone permission", err);
            setError("Microphone permission denied or unavailable. Please allow microphone access to record your speech.");
            setRecording(false);
            cleanupMedia();
        }
    };

    const stopRecording = () => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setAudioLevels([]);
        } catch (err) {
            console.error("Error stopping recorder:", err);
        } finally {
            setRecording(false);
            if (elapsedIntervalRef.current) {
                clearInterval(elapsedIntervalRef.current);
                elapsedIntervalRef.current = null;
            }
            setTimeout(() => cleanupMedia(), 300);
        }
    };

    const cleanupMedia = () => {
        try {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((t) => t.stop());
                mediaStreamRef.current = null;
            }
            mediaRecorderRef.current = null;
        } catch (e) {
            console.warn("cleanupMedia error:", e);
        }
    };

    const handleReset = () => {
        setAudio(null);
        setAudioBlob(null);
        setResult(null);
        setError('');
        setElapsed(0);
        setAudioLevels([]);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const fmtTime = (s) => {
        const mm = Math.floor(s / 60).toString().padStart(2, "0");
        const ss = (s % 60).toString().padStart(2, "0");
        return `${mm}:${ss}`;
    };

    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 8) return 'bg-green-100 border-green-300';
        if (score >= 6) return 'bg-yellow-100 border-yellow-300';
        return 'bg-red-100 border-red-300';
    };

    const getProgressColor = (score) => {
        if (score >= 8) return 'bg-green-500';
        if (score >= 6) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Dashboard>
            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                        <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        AI Speaking Assessment
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Record or upload your speech to get AI-powered feedback on clarity, confidence, and fluency
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2" role="alert">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Content Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
                    {/* Recording Controls */}
                    <div className="space-y-6">
                        {/* Upload Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Upload Audio File
                            </label>
                            <div className="flex items-center space-x-3">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleUpload}
                                        className="hidden"
                                        disabled={recording || loading}
                                    />
                                    <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">
                                            {audio ? audio.name || 'Audio file selected' : 'Choose audio file'}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                            </div>
                        </div>

                        {/* Recording Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Record Your Speech
                            </label>
                            <div className="space-y-4">
                                {/* Recording Button */}
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={recording ? stopRecording : startRecording}
                                        disabled={loading}
                                        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                                            recording
                                                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 animate-pulse'
                                                : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {recording ? (
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 6h12v12H6z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2s-2 .9-2 2v6c0 1.1.9 2 2 2zm5-3c0-2.8-2.2-5-5-5S7 8.2 7 11v1c0 2.8 2.2 5 5 5s5-2.2 5-5v-1z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Timer Display */}
                                <div className="text-center">
                                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                        recording ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
                                    }`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-lg font-mono font-semibold">{fmtTime(elapsed)}</span>
                                    </div>
                                </div>

                                {/* Audio Visualization */}
                                {recording && (
                                    <div className="flex items-center justify-center h-20 space-x-1">
                                        {audioLevels.length > 0 ? (
                                            audioLevels.map((level, index) => (
                                                <div
                                                    key={index}
                                                    className="w-1 bg-primary-500 rounded-full transition-all duration-75"
                                                    style={{
                                                        height: `${Math.max(4, (level / 255) * 100)}%`,
                                                        minHeight: '4px',
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            Array.from({ length: 20 }).map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="w-1 bg-gray-200 rounded-full animate-pulse"
                                                    style={{
                                                        height: `${20 + Math.random() * 60}%`,
                                                        animationDelay: `${index * 0.1}s`,
                                                    }}
                                                />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audio Preview */}
                        {audioUrl && !recording && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Audio Preview</span>
                                    <button
                                        onClick={handleReset}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <audio
                                    ref={audioRef}
                                    src={audioUrl}
                                    controls
                                    className="w-full h-10"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={analyzeSpeech}
                                disabled={(!audio && !audioBlob) || loading || recording}
                                className="w-full sm:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                        <span>Analyze Speech</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Transcript Card */}
                        {result.transcript && (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">Transcript</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-gray-800 leading-relaxed">{result.transcript}</p>
                                </div>
                            </div>
                        )}

                        {/* Scores Card */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="text-lg font-bold text-gray-900">Assessment Scores</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Clarity */}
                                <div className={`p-5 rounded-lg border-2 ${getScoreBgColor(result.clarity || 0)}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-700">Clarity</span>
                                        <span className={`text-2xl font-bold ${getScoreColor(result.clarity || 0)}`}>
                                            {result.clarity || 0}/10
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(result.clarity || 0)}`}
                                            style={{ width: `${((result.clarity || 0) / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Confidence */}
                                <div className={`p-5 rounded-lg border-2 ${getScoreBgColor(result.confidence || 0)}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-700">Confidence</span>
                                        <span className={`text-2xl font-bold ${getScoreColor(result.confidence || 0)}`}>
                                            {result.confidence || 0}/10
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(result.confidence || 0)}`}
                                            style={{ width: `${((result.confidence || 0) / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Fluency */}
                                <div className={`p-5 rounded-lg border-2 ${getScoreBgColor(result.fluency || 0)}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-700">Fluency</span>
                                        <span className={`text-2xl font-bold ${getScoreColor(result.fluency || 0)}`}>
                                            {result.fluency || 0}/10
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(result.fluency || 0)}`}
                                            style={{ width: `${((result.fluency || 0) / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Card */}
                        {result.feedback && (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">AI Feedback</h3>
                                </div>
                                <div className="bg-primary-50 rounded-lg p-5 border border-primary-200">
                                    <p className="text-gray-800 leading-relaxed">{result.feedback}</p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            >
                                New Assessment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </Dashboard>
    );
}

export default SpeakAssessment;
