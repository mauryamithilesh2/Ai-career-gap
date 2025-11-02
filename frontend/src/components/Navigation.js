import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav style={{
      backgroundColor: '#343a40',
      padding: '10px 20px',
      marginBottom: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
          Career Gap Analyzer
        </h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link 
            to="/login" 
            style={{ color: 'white', textDecoration: 'none', padding: '8px 16px' }}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            style={{ color: 'white', textDecoration: 'none', padding: '8px 16px' }}
          >
            Register
          </Link>
          <Link 
            to="/upload-resume" 
            style={{ color: 'white', textDecoration: 'none', padding: '8px 16px' }}
          >
            Upload Resume
          </Link>
          <Link 
            to="/upload-job" 
            style={{ color: 'white', textDecoration: 'none', padding: '8px 16px' }}
          >
            Upload Job
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

