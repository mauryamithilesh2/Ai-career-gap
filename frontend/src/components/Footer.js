import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">CareerGap</span>
            </div>
            <p className="text-gray-400 text-sm">AI-powered career analysis for job seekers.</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/upload-resume" className="hover:text-primary-400 transition">Upload Resume</Link></li>
              <li><Link to="/analysis" className="hover:text-primary-400 transition">View Analysis</Link></li>
              <li><Link to="/resume-generator" className="hover:text-primary-400 transition">Resume Generator</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-primary-400 transition">About</a></li>
              <li><a href="#contact" className="hover:text-primary-400 transition">Contact</a></li>
              <li><a href="#support" className="hover:text-primary-400 transition">Support</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              {[
                { name: 'LinkedIn', url: '#linkedin', icon: 'L' },
                { name: 'Twitter', url: '#twitter', icon: 'T' },
                { name: 'GitHub', url: '#github', icon: 'G' }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition"
                  title={social.name}
                  aria-label={social.name}
                >
                  <span className="text-sm font-bold">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} CareerGap. Build with ❤️ by Mithilesh.</p>
            <div className="flex gap-6 text-sm">
              <a href="#privacy" className="hover:text-primary-400 transition">Privacy Policy</a>
              <a href="#terms" className="hover:text-primary-400 transition">Terms of Service</a>
              <a href="#cookies" className="hover:text-primary-400 transition">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
