import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api/api';

function DashboardHome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statsData, setStatsData] = useState({
    total_resumes: 0,
    total_jobs: 0,
    total_analyses: 0,
    match_accuracy: 0,
    avg_analysis_time: 0,
    recent_activities: []
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getStats();
      setStatsData(res.data);
    } catch (e) {
      const errorMsg = e.response?.data?.detail || 
                      e.response?.data?.error ||
                      'Failed to load dashboard data.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      await fetchStats();
    }
    loadStats();
    return () => { isMounted = false; };
  }, []);

  const stats = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      value: String(statsData.total_resumes || 0),
      label: 'Resumes Uploaded',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      value: String(statsData.total_jobs || 0),
      label: 'Jobs Uploaded',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      value: statsData.total_analyses > 0 
        ? `${Number(statsData.match_accuracy || 0).toFixed(0)}%` 
        : '0%',
      label: 'Match Accuracy',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      value: statsData.total_analyses > 0 
        ? `${Number(statsData.avg_analysis_time || 0).toFixed(1)}s` 
        : '0s',
      label: 'Avg Analysis Time',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
    }
  ];

  const recentActivities = statsData.recent_activities || [];

  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Upload your resume for analysis',
      link: '/upload-resume',
    },
    {
      title: 'Upload Job',
      description: 'Upload job description for matching',
      link: '/upload-job',
    },
    {
      title: 'View Analysis',
      description: 'Check your career gap analysis',
      link: '/analysis',
    },
    {
      title: 'Profile Settings',
      description: 'Manage your account settings',
      link: '/profile',
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 truncate">
            Welcome back, {user?.first_name || user?.username || 'User'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Here's what's happening with your career analysis today.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap"
          title="Refresh dashboard data"
          aria-label="Refresh dashboard data"
        >
          <svg 
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
          <span className="sm:hidden">{loading ? '...' : '↻'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2" role="alert">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-300 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
            role="region"
            aria-label={`${stat.label}: ${stat.value}`}
          >
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-lg" />
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} ${stat.iconColor} rounded-lg flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" aria-live="polite">{stat.value}</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Get started with these common tasks</p>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="p-3 sm:p-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all duration-200 hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label={`${action.title}: ${action.description}`}
              >
                <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-primary-700 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest actions and results</p>
          </div>
          <div className="p-4 sm:p-6 space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 w-full animate-pulse bg-gray-200 rounded" />
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer focus-within:bg-gray-50"
                  role="button"
                  tabIndex={0}
                  aria-label={`${activity.title} - ${activity.status}`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg" aria-hidden="true">{activity.icon || '📄'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{activity.title}</h4>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.time ? new Date(activity.time).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize ${
                    activity.status === 'completed' 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : activity.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {activity.status || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm sm:text-base font-medium mb-2">No recent activity yet</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">Start by uploading a resume or job description</p>
                <Link 
                  to="/upload-resume" 
                  className="inline-block px-4 py-2 bg-primary-500 hover:bg-primary-600 text-gray-900 font-semibold rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Pro Tips</h2>
          <p className="text-sm text-gray-600 mt-1">Maximize your career analysis results</p>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Keep Resumes Updated</h3>
            <p className="text-sm text-gray-600">
              Upload your latest resume to get the most accurate career gap analysis.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Target Specific Roles</h3>
            <p className="text-sm text-gray-600">
              Upload job descriptions for roles you're interested in for better matching.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-sm text-gray-600">
              Regularly check your analysis to see how your skills are improving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
