import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, User, Mail, Phone, Lock } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    company_name: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!formData.full_name.trim()) {
      return 'Please enter your full name';
    }
    if (!formData.email.trim()) {
      return 'Please enter your email address';
    }
    if (formData.password.length <= 8) {
      return 'Password must be more than 8 characters long';
    }
    if (!/[A-Z]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter (A-Z)';
    }
    if (!/[a-z]/.test(formData.password)) {
      return 'Password must contain at least one lowercase letter (a-z)';
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      return 'Password must contain at least one special character (!@#$%^&*...)';
    }
    if (formData.password !== formData.confirm_password) {
      return 'Passwords do not match';
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Role is strictly 'customer' for public registration
      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        company_name: formData.company_name
      });
      navigate('/customer');
    } catch (err) {
      setError(err.message || 'Registration failed');
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

      {/* Registration Card */}
      <div className="bg-canvas-card rounded-2xl p-7 sm:p-8 shadow-elevated border border-line max-w-lg w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Customer Registration</h1>
          <p className="text-xs text-ink-muted mt-1">
            Create your account to manage subscriptions, request quotations, and track invoices.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-status-alertBg text-status-alertText p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-status-alertText/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-ink">Full Name</label>
            <div className="relative mt-1">
              <input
                type="text"
                required
                placeholder="Anna Jones"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30"
              />
              <User className="w-4 h-4 text-ink-subtle absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-ink">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                placeholder="anna.jones@acmecorp.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30"
              />
              <Mail className="w-4 h-4 text-ink-subtle absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold text-ink">Phone Number</label>
              <div className="relative mt-1">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30"
                />
                <Phone className="w-4 h-4 text-ink-subtle absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="text-xs font-bold text-ink">Company / Org (Optional)</label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-ink">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min 9 chars with Upper, Lower & Symbol"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-ink-subtle hover:text-ink"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-ink">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Confirm password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30"
            />
          </div>

          {/* Password requirements hint */}
          <div className="p-3 bg-sage-light/50 rounded-xl border border-line text-[11px] text-ink-muted">
            <span className="font-bold text-sage-dark">Security Requirement:</span> More than 8 characters, with at least 1 uppercase letter, 1 lowercase letter, and 1 special symbol (!@#$%^&*).
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-3 rounded-full shadow-soft transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Register Customer Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-sage-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
