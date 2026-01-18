import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { API } from '../api/api';
import logo from '../assets/logo.png';

export default function LoginPage({ onLogin }) {
  const [showSplash, setShowSplash] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await API.auth.login(
        formData.username,
        formData.password
      );
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        // Notify parent to update state and trigger navigation
        onLogin(result.user);

        // Automatic redirection based on role
        if (result.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (result.user.role === 'tutor') {
          window.location.href = '/tutor/dashboard';
        } else if (result.user.role === 'student') {
          window.location.href = '/student/dashboard';
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const letterAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden font-sans text-slate-100 flex items-center justify-center relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          >

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 1 } }}
              className="relative mb-6"
            >
              <img
                src={logo}
                alt="MulpiSipsa Logo"
                className="w-40 h-40 object-contain"
              />
            </motion.div>

            <motion.h1
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {'MulpiSipsa'.split('').map((char, index) => (
                <motion.span key={index} variants={letterAnimation} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-3 text-purple-200/60 text-sm tracking-widest uppercase"
            >
              Tuition Management System
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl mx-4 z-10 relative"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden flex flex-col md:flex-row">
              {/* LEFT SIDE: Brand / Welcome Section */}
              <div className="md:w-5/12 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-[60px] -ml-24 -mb-24"></div>

                <div className="relative z-10">
                  <img
                    src={logo}
                    alt="MulpiSipsa Logo"
                    className="w-32 h-32 mx-auto mb-6 object-contain filter drop-shadow-2xl"
                  />
                  <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
                  <p className="text-purple-100/70 text-sm font-medium max-w-[240px] mx-auto">
                    Sign in to access your learning and management portal.
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE: Login Form Section */}
              <div className="md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-slate-900/40">
                <div className="mb-8 block md:hidden text-center">
                  <p className="text-slate-400 text-sm">Please sign in to your account</p>
                </div>
                <div className="mb-8 hidden md:block">
                  <h3 className="text-2xl font-bold text-white mb-2">Sign In</h3>
                  <p className="text-slate-400 text-sm">Welcome back! Please enter your credentials.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      placeholder="Enter your username"
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/50 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      placeholder="••••••••"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600/50 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border border-slate-700 rounded-md bg-slate-900/50 checked:bg-purple-600 checked:border-purple-600 transition-all"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 rounded-xl text-white font-semibold flex items-center justify-center hover:from-purple-500 hover:to-indigo-500 transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-purple-600/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : null}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>
            </div>

            <p className="text-center text-slate-500 text-xs mt-10 tracking-widest uppercase opacity-50">
              © {new Date().getFullYear()} MulpiSipsa • All rights reserved
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <X className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password Recovery</h3>
                <p className="text-slate-400">
                  Please contact your administration to reset your password.
                </p>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
