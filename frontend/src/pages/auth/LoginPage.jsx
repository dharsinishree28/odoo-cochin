import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Shield, 
  Briefcase, 
  User, 
  Layers, 
  Sparkles, 
  CreditCard,
  CheckCircle2,
  Check
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [selectedPortal, setSelectedPortal] = useState('admin'); // 'admin' | 'staff' | 'customer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect immediately to their dashboard
  useEffect(() => {
    if (user && user.role) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const portals = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Platform control, pricing, staff & revenue analytics',
      icon: Shield,
      badge: 'Executive',
    },
    {
      id: 'staff',
      title: 'Staff',
      description: 'Customer requests, quotation drafting & batch billing',
      icon: Briefcase,
      badge: 'Operations',
    },
    {
      id: 'customer',
      title: 'Customer',
      description: 'Self-service subscriptions, offers, receipts & profile',
      icon: User,
      badge: 'Client',
    },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authenticatedUser = await login(email, password, selectedPortal, rememberMe);
      const destination = location.state?.from?.pathname || `/${authenticatedUser.role}/dashboard`;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Split-Screen Main Container */}
      <div className="bg-canvas-card rounded-3xl shadow-elevated border border-line overflow-hidden w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* LEFT SIDE — Branding Section */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#27382D] via-[#3D5647] to-[#1C2820] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-sage-light/10 blur-3xl pointer-events-none" />

          {/* Top: Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-soft">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 2zm0 15a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 17zm9.25-6.25a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zM6.25 10.75a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zm11.72-6.52a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zM7.8 14.43a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zm10.17 3.54a1.25 1.25 0 0 1-1.77 0l-1.77-1.77a1.25 1.25 0 0 1 1.77-1.77l1.77 1.77a1.25 1.25 0 0 1 0 1.77zM7.8 7.8a1.25 1.25 0 0 1-1.77 0L4.26 6.03a1.25 1.25 0 0 1 1.77-1.77L7.8 6.03a1.25 1.25 0 0 1 0 1.77z"/>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-none">Odoo Cochin</span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Enterprise Platform</span>
            </div>
          </div>

          {/* Middle: Welcome & 3 Feature Highlights */}
          <div className="relative z-10 my-8 sm:my-10 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Welcome to Odoo Cochin
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-2 font-medium leading-relaxed">
                Your complete subscription, offers and quotation management platform.
              </p>
            </div>

            {/* Three Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Subscription Management</h4>
                  <p className="text-[11px] text-white/70 leading-snug mt-0.5">
                    Automated multi-frequency recurring cycles, renewal alerts, and pausable contracts.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Exclusive Offers &amp; Quotations</h4>
                  <p className="text-[11px] text-white/70 leading-snug mt-0.5">
                    Dynamic pricing variants (+560 Odoo integration) and seamless 1-click quote approvals.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 transition-all flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Seamless Billing &amp; Payments</h4>
                  <p className="text-[11px] text-white/70 leading-snug mt-0.5">
                    One-click batch billing engine, automated tax calculation, and instant payment settlement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Role-Based Access Control • Salted Hash Security</span>
          </div>
        </div>

        {/* RIGHT SIDE — Sign In Section */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Sign In</h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-1 font-medium">
                Select your portal to continue.
              </p>
            </div>

            {/* Portal Selection Cards (Stacked) */}
            <div className="space-y-2.5 mb-6">
              {portals.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPortal === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPortal(p.id);
                      setError('');
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between border ${
                      isSelected
                        ? 'border-sage-dark bg-sage-light/70 shadow-soft ring-1 ring-sage-dark/40'
                        : 'border-line bg-canvas/20 hover:bg-canvas/50 hover:border-line-dark'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-sage-dark text-white shadow-soft' 
                          : 'bg-white text-ink-muted border border-line'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-ink">{p.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-white text-sage-dark font-bold' : 'bg-canvas text-ink-muted'
                          }`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">{p.description}</p>
                      </div>
                    </div>

                    {/* Radio / Check Indicator */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-sage-dark text-white ring-2 ring-sage-dark/20' 
                        : 'border-2 border-line bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mb-5 bg-status-alertBg text-status-alertText p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-status-alertText/20 shadow-soft animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={
                      selectedPortal === 'admin'
                        ? 'admin@odoocochin.com'
                        : selectedPortal === 'staff'
                        ? 'staff@odoocochin.com'
                        : 'customer@odoocochin.com'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-canvas/30 border border-line rounded-xl px-3.5 py-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/40 focus:border-sage-dark transition-all placeholder:text-ink-subtle"
                  />
                  <Mail className="w-4 h-4 text-ink-subtle absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password with Show/Hide */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-ink">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-sage-dark hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-canvas/30 border border-line rounded-xl px-3.5 py-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/40 focus:border-sage-dark transition-all pr-10 placeholder:text-ink-subtle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-ink-subtle hover:text-ink transition-colors p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-line text-sage-dark focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-ink-muted">Remember this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-soft transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in to {selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)} Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedPortal.charAt(0).toUpperCase() + selectedPortal.slice(1)} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Option */}
            <p className="mt-6 text-center text-xs text-ink-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-sage-dark hover:underline">
                Create Customer Account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
