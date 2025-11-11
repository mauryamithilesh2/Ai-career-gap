import React, { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { publicDashboardAPI} from '../api/api';
import { motion,  } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';
import careerImg from '../assets/career_path.jpg';
import Footer from './Footer';
import sachinImg from "../assets/sachin.png";
import princeImg from "../assets/prince.png";

function Home() {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    total_resumes: 0,
    total_jobs: 0,
    total_analyses: 0,
    match_accuracy: 0,
    avg_analysis_time: 0,
  });

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await publicDashboardAPI.getStats()
        setStatsData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { title: 'Upload Resume', link: '/login?redirect=/upload-resume' },
    { title: 'Upload Job', link: '/login?redirect=/upload-job' },
    { title: 'View Analysis', link: '/login?redirect=/analysis' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ✅ NAVBAR */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md h-16 shadow-sm border-b border-gray-100 z-50 flex items-center justify-between px-6" >
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/') }>
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">CareerGap</span>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center space-x-4">
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-gray-900 font-semibold rounded-lg transition hover:shadow-lg ">Login</button>
          <button onClick={() => navigate('/register')} className="px-4 py-2 bg-white border border-primary-500 text-primary-900 hover:bg-primary-50 rounded-lg font-semibold transition hover:shadow-md">Create Account</button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="sm:hidden p-2 rounded-lg border" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* ✅ MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200 shadow-sm p-4 space-y-3 fixed top-16 left-0 right-0 z-40">
          <button onClick={() => navigate('/login')} className="block w-full px-4 py-2 bg-primary-100 text-gray-900 rounded-lg font-semibold hover:bg-primary-200 hover:shadow-lg">Login</button>
          <button onClick={() => navigate('/register')} className="block w-full px-4 py-2 border border-primary-500 text-primary-700 rounded-lg  hover:shadow-md">Create Account</button>
        </div>
      )}

      {/* ✅ MAIN CONTENT */}
      <main className="flex-1 pt-12 md:pt-20 w-full mb-4 overflow-hidden">
        {/* ✅ INTERACTIVE HERO */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50/30 via-white to-white pt-18">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 -left-32 w-72 h-72 bg-primary-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
            <div className="absolute bottom-20 -right-32 w-72 h-72 bg-primary-200/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-primary-100/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center"
                >
                  <span className="px-4 py-2 rounded-full bg-primary-100 text-gray-700 text-sm font-semibold">
                   AI-Powered Platform
                  </span>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                    Transform Your{' '}
                    <span className=" bg-primary-600 bg-clip-text text-transparent">
                      Career Path
                    </span>
                  </h1>
                </motion.div>

                {/* Subheading */}
                <motion.p 
                  className="text-xl text-gray-700 leading-relaxed max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Unlock your potential with AI-powered career analysis, personalized insights, and actionable recommendations that help you stand out in today's competitive job market.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {quickActions.slice(0, 2).map((action, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, boxShadow: "0 12px 24px rgba(155, 213, 218, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(action.link)}
                      className={`px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                        i === 0 
                          ? 'bg-primary-200 text-gray hover:bg-primary-300 shadow-lg' 
                          : 'border-2 border-gray-100 text-primary-50 hover:text-white bg-gray-900 hover:bg-gray-600 hover:border-primary-50'
                      }`}
                    >
                      {action.title}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Trust Indicators */}
                {/* <motion.div 
                  className="flex items-center gap-6 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-primary-200 border-2 border-white"></div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600"><span className="font-semibold">500+</span> users trust us</span>
                  </div>
                </motion.div> */}
              </motion.div>

              {/* Right Image */}
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative z-10">
                  {/* Glowing background */}
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-primary-200/20 to-primary-100/10 rounded-3xl blur-2xl"
                  ></motion.div>
                  
                  {/* Image */}
                  <motion.img
                    src={careerImg}
                    alt="Career Progress"
                    className="relative w-full h-auto rounded-3xl shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ✅ FEATURES SECTION */}
        <section className="py-24 relative overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose CareerGap?
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Empower your career with intelligent tools designed to give you a competitive edge in your job search
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {[
                {
                  title: 'Smart Analysis',
                  description: 'AI-powered resume analysis and intelligent job matching algorithms',
                  icon: '🤖',
                },
                {
                  title: 'Instant Insights',
                  description: 'Real-time feedback and actionable recommendations within seconds',
                  icon: '⚡',
                },
                {
                  title: 'Skill Mapping',
                  description: 'Identify skill gaps and get personalized learning recommendations',
                  icon: '📊',
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(155, 213, 218, 0.15)" }}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-xl  bg-primary-200 flex items-center justify-center mb-6">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ ANIMATED STATS SECTION */}
        <section className="py-24 bg-gradient-to-br from-primary-50/40 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-gray-600">
                Our platform has helped users land their dream jobs
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-40 bg-gray-200 animate-pulse rounded-2xl" />
                ))
              ) : (
                <>
                  {[
                    { value: statsData.total_resumes, label: 'Resumes Analyzed', icon: '📄' },
                    { value: statsData.total_jobs, label: 'Jobs Matched', icon: '💼' },
                    { value: statsData.total_analyses > 0 ? `${statsData.match_accuracy}%` : '0%', label: 'Match Accuracy', icon: '🎯' },
                    { value: statsData.total_analyses > 0 ? `${statsData.avg_analysis_time}s` : '0s', label: 'Avg Analysis Time', icon: '⚡' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(155, 213, 218, 0.2)" }}
                      className="bg-white rounded-2xl p-8 text-center border border-gray-100 hover:border-primary-200 transition-all duration-300"
                    >
                      <span className="inline-block text-4xl mb-4">{stat.icon}</span>
                      <motion.h2 
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.2 + 0.3 }}
                      >
                        {stat.value}
                      </motion.h2>
                      <p className="text-gray-600 font-medium">{stat.label}</p>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ✅ HOW IT WORKS */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started in three simple steps and see your career transform
              </p>
            </motion.div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Upload Your Resume',
                  description: 'Share your resume and let our AI analyze your professional profile comprehensively',
                  // icon: '📤'
                },
                {
                  step: '02',
                  title: 'Explore Opportunities',
                  description: 'Browse from thousands of job positions or upload specific job descriptions',
                  // icon: '🔍'
                },
                {
                  step: '03',
                  title: 'Get Insights',
                  description: 'Receive detailed analysis, matching scores, and personalized improvement suggestions',
                  // icon: '✨'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  whileHover={{ y: -4 }}
                  className="relative group"
                >
                  {/* Connection Line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-20 right-0 w-full h-0.5  bg-primary-200 opacity-50 transform translate-x-full"></div>
                  )}

                  <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300 h-full relative z-10">
                    {/* Step Number */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-6">
                      <span className="font-bold text-gray-700">{item.step}</span>
                    </div>

                    {/* Icon */}
                    {/* <div className="text-4xl mb-4">{item.icon}</div> */}

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ TESTIMONIALS */}
        <section className="py-24 bg-gradient-to-br from-primary-50/20 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Loved by Our Users
              </h2>
              <p className="text-xl text-gray-900">
                Hear from people who've transformed their careers with CareerGap
              </p>
            </motion.div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: "Prince Yadav",
                  role: "Software Engineer",
                  avatar: princeImg,
                  comment: "CareerGap helped me identify the exact skills I needed to land my dream job at a top tech company. The insights were incredibly accurate!",
                  rating: 5
                },
                {
                  name: "Sachin Maurya",
                  role: "Web Developer",
                  avatar: sachinImg,
                  comment: "The AI-powered analysis gave me actionable insights I wouldn't have discovered myself. Highly recommended for anyone serious about their career!",
                  rating: 5
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(155, 213, 218, 0.2)" }}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300"
                >
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <motion.svg 
                        key={i} 
                        className="w-5 h-5 fill-yellow-400" 
                        viewBox="0 0 20 20"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">{testimonial.comment}</p>

                  {/* Author */}
                  <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


      </main>

        {/* ✅ CTA SECTION */}
        <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-gray-900 max-w-2xl mx-auto">
                Many professionals who are already seeing results. Start your free analysis today.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="inline-block px-10 py-4 bg-white text-primary-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Now
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ✅ FOOTER */}
        <Footer />
    </div>
  );
}

export default Home;
