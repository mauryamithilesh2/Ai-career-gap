import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import UploadJob from './components/Uploadjob';
import UploadResume from './components/UploadResume';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import ForgotPassword from './components/ForgotPassword';
import Analysis from './components/Analysis';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // ⏳ show loader for 3 sec
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2 className='color'>Loading Career Gap Analyzer...</h2>
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/dashboard" element={
          <Dashboard>
            <DashboardHome />
          </Dashboard>
        } />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/upload-job" element={<UploadJob />} />
      </Routes>
    </Router>
  );
}

export default App;
