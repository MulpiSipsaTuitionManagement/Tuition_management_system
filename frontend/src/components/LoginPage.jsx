import { useState } from 'react';
import { User } from 'lucide-react';
import '../styles/LoginPage.css';
import { motion } from "motion/react"
import bgimage from '../assets/bg.jpg';
import logoImage from '../assets/Logo.png';
import { Lock, Shield, Users, Search, Eye, EyeOff, Home } from 'lucide-react';



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign in attempt:', { email, password, rememberMe });
  };

  return (
    <div className="signin-container" >
      <div style={{ maxWidth: '1400px', width: '100%' }}>
        <div className="content-wrapper">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="institute-card">
            <div className="institute-logo">
              <img src={logoImage} alt="Mulpi Sipsa Institute Logo" />
            </div>

            <div className="sheild-container">
              <Shield className="sheild" />
              <h2 className=".institute-portal">Secure Access Portal</h2>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }} className="signin-card">
            <h2 className="signin-title">Sign in to your account</h2>
            <p className="signin-subtitle">Use your institute credentials</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="admin@mulpi-sipsa.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="form-hint">Use your institute email</p>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="form-hint">Must be at least 8 characters</p>
              </div>

              <div className="form-footer">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 0.9 }}
                whileTap={{ scale: 0.8 }}
                type="submit" className="signin-button">
                Sign In

              </motion.button>
            </form>
            <div className="security-footer">
              <p className="security-text">
                Your connection is secured with enterprise-grade encryption.
              </p>
              <p className="version-text">v1.0.0</p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default Login;
