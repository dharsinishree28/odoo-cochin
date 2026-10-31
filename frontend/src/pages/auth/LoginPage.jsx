import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, quickSwitch } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function redirectByRole(role) {
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else navigate('/customer');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, rememberMe);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickDemo(role) {
    setError('');
    setLoading(true);
    try {
      const user = await quickSwitch(role);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2 mb-6 group">
        <div className="w-10 h-10 rounded-full bg-sage-dark text-white flex items-center justify-center shadow-soft">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 2zm0 15a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 17zm9.25-6.25a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zM6.25 10.75a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zm11.72-6.52a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zM7.8 14.43a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zm10.17 3.54a1.25 1.25 0 0 1-1.77 0l-1.77-1.77a1.25 1.25 0 0 1 1.77-1.77l1.77 1.77a1.25 1.25 0 0 1 0 1.77zM7.8 7.8a1.25 1.25 0 0 1-1.77 0L4.26 6.03a1.25 1.25 0 0 1 1.77-1.77L7.8 6.03a1.25 1.25 0 0 1 0 1.77z"/>
          </svg>
        </div>
        <div className="text-left">
          <span className="font-extrabold text-lg text-ink block leading-none">Brightloop</span>
          <span className="text-[10px] font-bold text-sage-dark uppercase tracking-widest">Software</span>
        </div>
      </Link>

      {/* Main Login Card */}
      <div className="bg-canvas-card rounded-2xl p-7 sm:p-8 shadow-elevated border border-line max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Sign In</h1>
          <p className="text-xs text-ink-muted mt-1">
            Access your Subscription, Quotation &amp; Billing workspace
          </p>
        </div>

        {/* Reviewer Quick Access Toolbar */}
        <div className="mb-5 p-3.5 bg-sage-light/60 rounded-xl border border-line">
          <p className="text-[11px] font-bold text-sage-dark uppercase tracking-wider text-center mb-2">
            One-Click Role Login Demo
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('admin')}
              className="bg-white hover:bg-sage-dark hover:text-white text-ink text-[11px] font-bold py-1.5 px-2 rounded-lg border border-line transition-all shadow-soft"
            >
              Admin
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('staff')}
              className="bg-white hover:bg-sage-dark hover:text-white text-ink text-[11px] font-bold py-1.5 px-2 rounded-lg border border-line transition-all shadow-soft"
            >
              Staff
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('customer')}
              className="bg-white hover:bg-sage-dark hover:text-white text-ink text-[11px] font-bold py-1.5 px-2 rounded-lg border border-line transition-all shadow-soft"
            >
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-status-alertBg text-status-alertText p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-status-alertText/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-ink">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30 focus:border-sage-primary"
              />
              <Mail className="w-4 h-4 text-ink-subtle absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password with Show/Hide */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-ink">Password</label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-sage-dark hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30 focus:border-sage-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-ink-subtle hover:text-ink transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-line text-sage-dark focus:ring-0"
              />
              <span className="text-xs text-ink-muted">Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-3 rounded-full shadow-soft transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-xs text-ink-muted">
          New customer?{' '}
          <Link to="/register" className="font-bold text-sage-dark hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
