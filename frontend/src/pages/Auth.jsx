// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Auth.jsx
// Description: Modern, enterprise-grade unified authentication interface
//              featuring role-aware Sign In, animated Create Account transition,
//              brand visual hero area, micro-interactions, and full accessibility.
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  User,
  Activity,
  Shield,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import '../styles/forms.css';

// The three standardized system roles
const ROLES = [
  {
    id: 'USER',
    label: 'User',
    tag: 'Personal',
    desc: 'Find and charge your EV',
    icon: User,
  },
  {
    id: 'OPERATOR',
    label: 'Operator',
    tag: 'Station Ops',
    desc: 'Manage charging stations',
    icon: Activity,
  },
  {
    id: 'ADMIN',
    label: 'Admin',
    tag: 'Management',
    desc: 'Manage the VOLTIX network',
    icon: Shield,
  },
];

export default function Auth({ defaultMode = 'login' }) {
  const { login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mode derived from route path or prop
  const isRegisterRoute = location.pathname === '/register' || defaultMode === 'register';
  const [mode, setMode] = useState(isRegisterRoute ? 'register' : 'login');
  const [direction, setDirection] = useState('forward'); // 'forward' (slide left) or 'backward' (slide right)
  const prevPathRef = useRef(location.pathname);

  // Sync mode with route changes (e.g. browser back/forward)
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      if (location.pathname === '/register') {
        setDirection('forward');
        setMode('register');
      } else if (location.pathname === '/login') {
        setDirection('backward');
        setMode('login');
      }
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  // Sign In state
  const [selectedRole, setSelectedRole] = useState('USER');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerShowConfirm, setRegisterShowConfirm] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);

  // Active role index for indicator positioning
  const selectedRoleIndex = ROLES.findIndex((r) => r.id === selectedRole);

  // Role keyboard navigation (ArrowLeft, ArrowRight, ArrowUp, ArrowDown)
  const handleRoleKeyDown = (e, currentIndex) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % ROLES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + ROLES.length) % ROLES.length;
    }
    if (nextIndex !== currentIndex) {
      setSelectedRole(ROLES[nextIndex].id);
      // Focus the new radio button
      const nextBtn = document.getElementById(`role-btn-${ROLES[nextIndex].id}`);
      if (nextBtn) nextBtn.focus();
    }
  };

  // Switch between Sign In and Create Account
  const handleSwitchToRegister = (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setDirection('forward');
    setMode('register');
    navigate('/register');
  };

  const handleSwitchToLogin = (e) => {
    if (e) e.preventDefault();
    setRegisterErrors({});
    setDirection('backward');
    setMode('login');
    navigate('/login');
  };

  // Redirect after successful login based on account role
  const redirectByRole = (role) => {
    if (role === 'ADMIN') {
      navigate('/admin');
    } else if (role === 'OPERATOR') {
      navigate('/operator');
    } else {
      navigate('/dashboard');
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both your email address and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const user = await login(loginEmail, loginPassword, selectedRole);
      redirectByRole(user.role);
    } catch (err) {
      setLoginError(
        err.message || 'Unable to sign in with the selected role. Please verify your account type and credentials.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register Validation & Submit
  const validateRegister = () => {
    const errs = {};
    if (!registerData.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!registerData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errs.email = 'Valid email address required';
    }
    if (!registerData.phone.trim() || !/^[+]?[0-9- ]{10,15}$/.test(registerData.phone)) {
      errs.phone = 'Valid phone number required';
    }
    if (registerData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (registerData.password !== registerData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setRegisterErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setRegisterLoading(true);
    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setRegisterErrors({
        global: err.message || 'Registration could not be completed. Please check your details.',
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="auth-viewport-wrapper">
      <div className="auth-card-shell">
        {/* Top Centered Brand Logo & Title */}
        <div className="auth-brand-center">
          <Link to="/" className="auth-brand-link" title="Return to Voltix Home">
            <div className="auth-brand-icon">
              <Zap size={22} className="brand-zap" />
            </div>
            <span className="auth-brand-title">VOLTIX</span>
          </Link>
          <span className="auth-brand-pill">INFRASTRUCTURE CORE</span>
        </div>

        {/* Interactive Auth Form Content */}
        <main className="auth-form-pane">
          <div className="auth-form-inner">
            {/* Viewport for directional sliding transition */}
            <div
              className={`auth-transition-stage ${
                mode === 'login' ? 'stage-login' : 'stage-register'
              } dir-${direction}`}
            >
              {/* ========================================================= */}
              {/* 1. SIGN IN VIEW                                           */}
              {/* ========================================================= */}
              {mode === 'login' && (
                <div className="auth-panel-content animate-slide-in">
                  {/* Header */}
                  <div className="auth-panel-header stagger-item" style={{ animationDelay: '0ms' }}>
                    <h2 className="auth-panel-title">Welcome back</h2>
                    <p className="auth-panel-subtitle">Sign in to access your urban charging dashboard</p>
                  </div>

                  {/* Role Selector */}
                  <div
                    className="auth-role-section stagger-item"
                    style={{ animationDelay: '40ms' }}
                  >
                    <label className="auth-role-heading" id="role-selector-label">
                      Select Portal Role
                    </label>

                    <div
                      className="auth-role-selector"
                      role="radiogroup"
                      aria-labelledby="role-selector-label"
                    >
                      {/* Smooth sliding active background highlight */}
                      <div
                        className="role-sliding-indicator"
                        style={{
                          transform: `translateX(${selectedRoleIndex * 100}%)`,
                        }}
                        aria-hidden="true"
                      />

                      {ROLES.map((r, idx) => {
                        const isSelected = selectedRole === r.id;
                        const RoleIcon = r.icon;
                        return (
                          <button
                            key={r.id}
                            id={`role-btn-${r.id}`}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isSelected ? 0 : -1}
                            className={`role-choice-card ${isSelected ? 'is-active' : ''}`}
                            onClick={() => setSelectedRole(r.id)}
                            onKeyDown={(e) => handleRoleKeyDown(e, idx)}
                          >
                            <div className="role-card-topbar">
                              <span className={`role-card-icon-box ${isSelected ? 'active' : ''}`}>
                                <RoleIcon size={16} />
                              </span>
                              <span className={`role-card-tag ${isSelected ? 'active' : ''}`}>
                                {r.tag}
                              </span>
                            </div>
                            <span className="role-card-title">{r.label}</span>
                            <span className="role-card-subtext">{r.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>



                  {/* Polished Inline Error Alert */}
                  {loginError && (
                    <div className="auth-error-banner" role="alert" aria-live="polite">
                      <AlertCircle size={17} className="error-icon-svg" />
                      <div className="error-message-body">{loginError}</div>
                    </div>
                  )}

                  {/* Sign In Form */}
                  <form onSubmit={handleLoginSubmit} noValidate>
                    {/* Email Input */}
                    <div className="form-field-group stagger-item" style={{ animationDelay: '80ms' }}>
                      <label className="form-field-label" htmlFor="login-email">
                        Email Address
                      </label>
                      <div className="input-affix-container">
                        <Mail size={17} className="input-leading-icon" aria-hidden="true" />
                        <input
                          id="login-email"
                          type="email"
                          className="form-field-input"
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (loginError) setLoginError('');
                          }}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-field-group stagger-item" style={{ animationDelay: '120ms' }}>
                      <div className="field-label-row">
                        <label className="form-field-label" htmlFor="login-password">
                          Password
                        </label>
                      </div>
                      <div className="input-affix-container">
                        <Lock size={17} className="input-leading-icon" aria-hidden="true" />
                        <input
                          id="login-password"
                          type={loginShowPassword ? 'text' : 'password'}
                          className="form-field-input"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (loginError) setLoginError('');
                          }}
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="input-trailing-action"
                          onClick={() => setLoginShowPassword(!loginShowPassword)}
                          aria-label={loginShowPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {loginShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Device Checkbox */}
                    <div className="auth-remember-row stagger-item" style={{ animationDelay: '160ms' }}>
                      <label className="auth-checkbox-label">
                        <input
                          type="checkbox"
                          className="auth-custom-checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="checkbox-custom-ui" aria-hidden="true">
                          {rememberMe && <CheckCircle2 size={13} className="check-svg" />}
                        </span>
                        <span className="checkbox-text">Remember this device</span>
                      </label>
                    </div>

                    {/* Primary Submit Button */}
                    <div className="stagger-item" style={{ animationDelay: '200ms' }}>
                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <div className="btn-loading-state">
                            <span className="btn-spinner" aria-hidden="true" />
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          <div className="btn-label-state">
                            <span>Sign In to VOLTIX</span>
                            <ArrowRight size={16} className="btn-arrow-icon" />
                          </div>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Auth Switch Link */}
                  <div
                    className="auth-switch-box stagger-item"
                    style={{ animationDelay: '240ms' }}
                  >
                    <span className="switch-prompt-text">Don't have an account?</span>{' '}
                    <button
                      type="button"
                      onClick={handleSwitchToRegister}
                      className="auth-switch-btn"
                    >
                      <span>Create an account</span>
                      <ArrowRight size={14} className="switch-arrow-icon" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 2. CREATE ACCOUNT VIEW                                    */}
              {/* ========================================================= */}
              {mode === 'register' && (
                <div className="auth-panel-content animate-slide-in">
                  {/* Header */}
                  <div className="auth-panel-header stagger-item" style={{ animationDelay: '0ms' }}>
                    <h2 className="auth-panel-title">Create an Account</h2>
                    <p className="auth-panel-subtitle">Join the VOLTIX municipal EV charging network</p>
                  </div>

                  {/* Global Registration Error */}
                  {registerErrors.global && (
                    <div className="auth-error-banner" role="alert" aria-live="polite">
                      <AlertCircle size={17} className="error-icon-svg" />
                      <div className="error-message-body">{registerErrors.global}</div>
                    </div>
                  )}

                  {/* Registration Form */}
                  <form onSubmit={handleRegisterSubmit} noValidate>
                    {/* Row 1: Full Name & Email Address (2-Column Desktop Grid) */}
                    <div className="form-dual-grid stagger-item" style={{ animationDelay: '40ms' }}>
                      {/* Full Name */}
                      <div className="form-field-group">
                        <label className="form-field-label" htmlFor="register-name">
                          Full Name
                        </label>
                        <div className="input-affix-container">
                          <User size={17} className="input-leading-icon" aria-hidden="true" />
                          <input
                            id="register-name"
                            type="text"
                            className={`form-field-input ${registerErrors.name ? 'is-invalid' : ''}`}
                            placeholder="Ayush Sharma"
                            value={registerData.name}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, name: e.target.value });
                              if (registerErrors.name) setRegisterErrors({ ...registerErrors, name: '' });
                            }}
                            required
                            autoComplete="name"
                          />
                        </div>
                        {registerErrors.name && (
                          <div className="field-inline-error">{registerErrors.name}</div>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="form-field-group">
                        <label className="form-field-label" htmlFor="register-email">
                          Email Address
                        </label>
                        <div className="input-affix-container">
                          <Mail size={17} className="input-leading-icon" aria-hidden="true" />
                          <input
                            id="register-email"
                            type="email"
                            className={`form-field-input ${registerErrors.email ? 'is-invalid' : ''}`}
                            placeholder="name@example.com"
                            value={registerData.email}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, email: e.target.value });
                              if (registerErrors.email) setRegisterErrors({ ...registerErrors, email: '' });
                            }}
                            required
                            autoComplete="email"
                          />
                        </div>
                        {registerErrors.email && (
                          <div className="field-inline-error">{registerErrors.email}</div>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Phone Number (Full Width) */}
                    <div className="form-field-group stagger-item" style={{ animationDelay: '80ms' }}>
                      <label className="form-field-label" htmlFor="register-phone">
                        Phone Number
                      </label>
                      <div className="input-affix-container">
                        <Phone size={17} className="input-leading-icon" aria-hidden="true" />
                        <input
                          id="register-phone"
                          type="tel"
                          className={`form-field-input ${registerErrors.phone ? 'is-invalid' : ''}`}
                          placeholder="+91-9876543210"
                          value={registerData.phone}
                          onChange={(e) => {
                            setRegisterData({ ...registerData, phone: e.target.value });
                            if (registerErrors.phone) setRegisterErrors({ ...registerErrors, phone: '' });
                          }}
                          required
                          autoComplete="tel"
                        />
                      </div>
                      {registerErrors.phone && (
                        <div className="field-inline-error">{registerErrors.phone}</div>
                      )}
                    </div>

                    {/* Row 3: Password & Confirm Password (2-Column Desktop Grid) */}
                    <div className="form-dual-grid stagger-item" style={{ animationDelay: '120ms' }}>
                      {/* Password */}
                      <div className="form-field-group">
                        <label className="form-field-label" htmlFor="register-password">
                          Password
                        </label>
                        <div className="input-affix-container">
                          <Lock size={17} className="input-leading-icon" aria-hidden="true" />
                          <input
                            id="register-password"
                            type={registerShowPassword ? 'text' : 'password'}
                            className={`form-field-input ${registerErrors.password ? 'is-invalid' : ''}`}
                            placeholder="At least 6 chars"
                            value={registerData.password}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, password: e.target.value });
                              if (registerErrors.password) setRegisterErrors({ ...registerErrors, password: '' });
                            }}
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="input-trailing-action"
                            onClick={() => setRegisterShowPassword(!registerShowPassword)}
                            aria-label={registerShowPassword ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                          >
                            {registerShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {registerErrors.password && (
                          <div className="field-inline-error">{registerErrors.password}</div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="form-field-group">
                        <label className="form-field-label" htmlFor="register-confirm-password">
                          Confirm Password
                        </label>
                        <div className="input-affix-container">
                          <Lock size={17} className="input-leading-icon" aria-hidden="true" />
                          <input
                            id="register-confirm-password"
                            type={registerShowConfirm ? 'text' : 'password'}
                            className={`form-field-input ${registerErrors.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="Re-enter password"
                            value={registerData.confirmPassword}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, confirmPassword: e.target.value });
                              if (registerErrors.confirmPassword)
                                setRegisterErrors({ ...registerErrors, confirmPassword: '' });
                            }}
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="input-trailing-action"
                            onClick={() => setRegisterShowConfirm(!registerShowConfirm)}
                            aria-label={registerShowConfirm ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                          >
                            {registerShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {registerErrors.confirmPassword && (
                          <div className="field-inline-error">{registerErrors.confirmPassword}</div>
                        )}
                      </div>
                    </div>

                    {/* Notice for Public Registration */}
                    <div className="account-type-notice stagger-item" style={{ animationDelay: '160ms' }}>
                      <span className="notice-badge">DRIVER ACCOUNT</span>
                      <span className="notice-text">
                        Standard driver registration for finding chargers, reserving bays, and managing payments.
                      </span>
                    </div>

                    {/* Submit Button */}
                    <div className="stagger-item" style={{ animationDelay: '200ms' }}>
                      <button
                        type="submit"
                        className="auth-primary-btn"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <div className="btn-loading-state">
                            <span className="btn-spinner" aria-hidden="true" />
                            <span>Creating account...</span>
                          </div>
                        ) : (
                          <div className="btn-label-state">
                            <span>Create Account</span>
                            <ArrowRight size={16} className="btn-arrow-icon" />
                          </div>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Auth Switch Link */}
                  <div
                    className="auth-switch-box stagger-item"
                    style={{ animationDelay: '240ms' }}
                  >
                    <span className="switch-prompt-text">Already have an account?</span>{' '}
                    <button
                      type="button"
                      onClick={handleSwitchToLogin}
                      className="auth-switch-btn"
                    >
                      <span>Sign in</span>
                      <ArrowRight size={14} className="switch-arrow-icon" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
