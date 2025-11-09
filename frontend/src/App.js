import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate,useLocation } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import UploadJob from './components/Uploadjob';
import UploadResume from './components/UploadResume';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import ForgotPassword from './components/ForgotPassword';
import Analysis from './components/Analysis';
import Profile from './components/Profile';
import GoogleCallback from './components/GoogleCallback';
import ResumeGenerator from './components/ResumeGenerator';
import SpeakAssessment from './components/SpeakAssessment';
import './App.css';




// private route for control unothourise access

function PrivateRoute({children})
{
  const token=localStorage.getItem('access');
  const location=useLocation();

if(!token){
  return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace/>
}
  return children;
}



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
      <AppRoutes />
    </Router>
  );
}

  function AppRoutes() {
    return(
      <Routes>
        {/* this is pub;lic route open for all */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/google-success" element={<GoogleCallback  />} />

        {/* protected route */}
        <Route path="/profile"  element={ <PrivateRoute> <Profile /> </PrivateRoute> } />
        <Route path="/analysis" element={<PrivateRoute> <Analysis /> </PrivateRoute>} />
        <Route path="/dashboard" element={  <PrivateRoute>  <Dashboard>
                          <DashboardHome />
                        </Dashboard>        </PrivateRoute> } />
        <Route path="/upload-resume" element={<PrivateRoute> <UploadResume /> </PrivateRoute>} />
        <Route path="/upload-job" element={<PrivateRoute> <UploadJob /> </PrivateRoute>} />
        <Route path="/resume-generator" element={<PrivateRoute> <ResumeGenerator/> </PrivateRoute>}/>
        <Route path="/speak-assessment" element={<PrivateRoute> <SpeakAssessment/> </PrivateRoute>}/>

        {/* <Route path="/google/callback" element={<GoogleCallback />} /> */}

      </Routes>
   );

}

export default App;
