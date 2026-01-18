import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../api/api';
import logo from '../assets/logo.png';

export default function LoginPage({ onLogin }) {
  const [showSplash, setShowSplash] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        formData.password,
        formData.role
      );
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        onLogin(result.user);
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
            className="w-full max-w-md p-6 z-10 relative"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">

              <div className="text-center mb-5">
                <img
                  src={logo}
                  alt="MulpiSipsa Logo"
                  className="w-auto h-24 mx-auto mb-3 object-contain"
                />
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400">Sign in to continue to your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm text-slate-300">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Login As</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3 rounded-xl text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="tutor">Tutor</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3 rounded-xl text-white font-semibold"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>

            <p className="text-center text-slate-500 text-sm mt-8">
              © {new Date().getFullYear()} MulpiSipsa. All rights reserved.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
