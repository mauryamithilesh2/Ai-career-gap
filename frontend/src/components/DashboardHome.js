import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardHome() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);
  const stats = [
    {
      icon: '📄',
      value: '12',
      label: 'Resumes Uploaded',
      change: '+2 this week',
      changeType: 'positive',
      color: 'bg-blue-500'
    },
    {
      icon: '💼',
      value: '8',
      label: 'Jobs Analyzed',
      change: '+1 today',
      changeType: 'positive',
      color: 'bg-green-500'
    },
    {
      icon: '📊',
      value: '95%',
      label: 'Match Accuracy',
      change: '+5% this month',
      changeType: 'positive',
      color: 'bg-purple-500'
    },
    {
      icon: '⏱️',
      value: '2.3s',
      label: 'Avg Analysis Time',
      change: '-0.5s faster',
      changeType: 'positive',
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    {
      type: 'resume',
      title: 'Software Engineer Resume',
      time: '2 hours ago',
      status: 'completed',
      icon: '📄'
    },
    {
      type: 'job',
      title: 'Frontend Developer Position',
      time: '4 hours ago',
      status: 'analyzing',
      icon: '💼'
    },
    {
      type: 'analysis',
      title: 'Career Gap Report Generated',
      time: '1 day ago',
      status: 'completed',
      icon: '📊'
    },
    {
      type: 'resume',
      title: 'Data Scientist Resume',
      time: '2 days ago',
      status: 'completed',
      icon: '📄'
    }
  ];

  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Upload your resume for analysis',
      icon: '📄',
      link: '/upload-resume',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Upload Job',
      description: 'Upload job description for matching',
      icon: '💼',
      link: '/upload-job',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'View Analysis',
      description: 'Check your career gap analysis',
      icon: '📊',
      link: '/analysis',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Profile Settings',
      description: 'Manage your account settings',
      icon: '⚙️',
      link: '/profile',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || user?.username || 'User'} 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your career analysis today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color} text-white`}>
              {stat.icon}
            </div>
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-label">{stat.label}</p>
            <p className={`stat-change ${stat.changeType}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
            <p className="card-subtitle">Get started with these common tasks</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`p-4 rounded-lg bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all duration-200 hover:scale-105`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <p className="card-subtitle">Your latest actions and results</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💡 Pro Tips</h2>
            <p className="card-subtitle">Maximize your career analysis results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold mb-2">Keep Resumes Updated</h3>
              <p className="text-sm text-gray-600">
                Upload your latest resume to get the most accurate career gap analysis.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Target Specific Roles</h3>
              <p className="text-sm text-gray-600">
                Upload job descriptions for roles you're interested in for better matching.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600">
                Regularly check your analysis to see how your skills are improving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;

