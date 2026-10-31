import React, { useState } from 'react';
import { api } from '../api/client';
import { X, Lock, Mail, User, Building, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, currentPortal }) {
  const [mode, setMode] = useState('login'); // login, register, forgot
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    phone: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ email: formData.email, password: formData.password });
        localStorage.setItem('brightloop_token', res.token);
        onAuthSuccess(res.user);
        onClose();
      } else if (mode === 'register') {
        // Password validation is checked on backend and also here
        const res = await api.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          company_name: formData.company_name,
          phone: formData.phone,
          role: 'customer'
        });
        localStorage.setItem('brightloop_token', res.token);
        onAuthSuccess(res.user);
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(formData.email);
        setSuccess(res.message);
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  }

  // Quick Switch demo login shortcuts
  function quickLogin(email, pw) {
    setFormData(prev => ({ ...prev, email, password: pw }));
    api.login({ email, password: pw })
      .then(res => {
        localStorage.setItem('brightloop_token', res.token);
        onAuthSuccess(res.user);
        onClose();
      })
      .catch(err => setError(err.message));
  }

  return (
    <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-7 shadow-2xl border border-[#E2E6E3] max-w-md w-full relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-muted hover:text-charcoal w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F2F5F3] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-sage-light text-sage-deep mx-auto flex items-center justify-center mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-charcoal">
            {mode === 'login' ? 'Welcome Back to Brightloop' : mode === 'register' ? 'Create Customer Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-muted mt-1">
            {mode === 'login' 
              ? 'Access your subscription portal and management tools'
              : mode === 'register'
              ? 'Password must be >8 characters with uppercase, lowercase & symbol'
              : 'Enter your email to receive a password reset token'}
          </p>
        </div>

        {/* Demo Fast Login Shortcuts */}
        {mode === 'login' && (
          <div className="mb-5 p-3 bg-[#FAF9F5] rounded-2xl border border-[#ECECE6]">
            <p className="text-[11px] font-bold text-slate-muted mb-2 uppercase tracking-wider text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('carlic@gmail.com', 'Password@123')}
                className="bg-white hover:bg-sage-light text-charcoal text-[11px] font-bold py-1.5 px-2 rounded-xl border border-[#E2E6E3] transition-colors"
              >
                Admin (Carlic)
              </button>
              <button
                type="button"
                onClick={() => quickLogin('sarah.sales@brightloop.com', 'Staff@1234')}
                className="bg-white hover:bg-sage-light text-charcoal text-[11px] font-bold py-1.5 px-2 rounded-xl border border-[#E2E6E3] transition-colors"
              >
                Staff (Sarah)
              </button>
              <button
                type="button"
                onClick={() => quickLogin('anna.jones@acmecorp.com', 'Customer@123')}
                className="bg-white hover:bg-sage-light text-charcoal text-[11px] font-bold py-1.5 px-2 rounded-xl border border-[#E2E6E3] transition-colors"
              >
                Customer (Anna)
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-alert-rose text-alert-roseText p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-sage-light text-sage-deep p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-charcoal">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Anna Jones"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-charcoal">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-charcoal">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] font-semibold text-sage-deep hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-deep text-white text-xs font-bold py-2.5 rounded-full hover:bg-sage-primary shadow-sm transition-all mt-2"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-5 text-center text-xs text-slate-muted">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-sage-deep hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-sage-deep hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
