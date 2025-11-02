import React from 'react';
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

function App() {
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
