import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setSuccess(res.message || 'Password reset link sent to your registered email.');
    } catch (err) {
      setError(err.message || 'Unable to process password reset');
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

      <div className="bg-canvas-card rounded-2xl p-7 sm:p-8 shadow-elevated border border-line max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Reset Password</h1>
          <p className="text-xs text-ink-muted mt-1">
            Enter your registered email and we'll send you a recovery link
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-status-alertBg text-status-alertText p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-status-alertText/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-status-successBg text-status-successText p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-status-successText/20">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-ink">Registered Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-canvas/40 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sage-primary/30"
              />
              <Mail className="w-4 h-4 text-ink-subtle absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-3 rounded-full shadow-soft transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Sending link...' : 'Send Password Reset Link'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-dark hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
