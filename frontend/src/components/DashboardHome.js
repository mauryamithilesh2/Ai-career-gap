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

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await dashboardAPI.getStats();
        if (!isMounted) return;
        setStatsData(res.data);
      } catch (e) {
        if (!isMounted) return;
        const errorMsg = e.response?.data?.detail || 
                        e.response?.data?.error ||
                        'Failed to load dashboard data.';
        setError(errorMsg);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const stats = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      value: String(statsData.total_resumes),
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
      value: String(statsData.total_jobs),
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
      value: `${Number(statsData.match_accuracy).toFixed(0)}%`,
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
      value: `${Number(statsData.avg_analysis_time).toFixed(1)}s`,
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || user?.username || 'User'}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your career analysis today.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ) : (
              <>
                <div className={`w-12 h-12 ${stat.bgColor} ${stat.iconColor} rounded-lg flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Get started with these common tasks</p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="p-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all duration-200 hover:shadow-md group"
              >
                <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-primary-700">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest actions and results</p>
          </div>
          <div className="p-6 space-y-3">
            {(loading ? Array.from({ length: 4 }) : recentActivities).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {loading ? (
                  <div className="h-12 w-full animate-pulse bg-gray-200 rounded" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                      <p className="text-xs text-gray-500">{new Date(activity.time).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' 
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {activity.status}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Pro Tips</h2>
          <p className="text-sm text-gray-600 mt-1">Maximize your career analysis results</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
