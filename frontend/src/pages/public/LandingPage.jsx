import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Layers, 
  Tag, 
  CreditCard,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicData() {
      try {
        const [pl, d] = await Promise.all([
          api.getPlans(true),
          api.getDiscounts()
        ]);
        setPlans(pl);
        setDiscounts(d);
      } catch (err) {
        console.warn("Public data load:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      {/* 1. Header & Navigation Bar */}
      <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-md border-b border-line px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-sage-dark text-white flex items-center justify-center shadow-soft group-hover:rotate-45 transition-transform duration-300">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 2zm0 15a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 12 17zm9.25-6.25a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zM6.25 10.75a1.25 1.25 0 0 1 0 2.5h-2.5a1.25 1.25 0 0 1 0-2.5h2.5zm11.72-6.52a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zM7.8 14.43a1.25 1.25 0 0 1 0 1.77l-1.77 1.77a1.25 1.25 0 0 1-1.77-1.77l1.77-1.77a1.25 1.25 0 0 1 1.77 0zm10.17 3.54a1.25 1.25 0 0 1-1.77 0l-1.77-1.77a1.25 1.25 0 0 1 1.77-1.77l1.77 1.77a1.25 1.25 0 0 1 0 1.77zM7.8 7.8a1.25 1.25 0 0 1-1.77 0L4.26 6.03a1.25 1.25 0 0 1 1.77-1.77L7.8 6.03a1.25 1.25 0 0 1 0 1.77z"/>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-ink">Brightloop</span>
              <span className="text-[10px] block font-semibold text-sage-dark uppercase tracking-widest -mt-1">Software</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-ink-muted">
            <a href="#home" className="hover:text-ink transition-colors">Home</a>
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#plans" className="hover:text-ink transition-colors">Subscription Plans</a>
            <a href="#offers" className="hover:text-ink transition-colors">Offers</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate(`/${user.role}`)}
                className="flex items-center gap-2 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-4 py-2 rounded-full shadow-soft transition-all"
              >
                <span>Go to Portal ({user.role})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-ink hover:text-sage-dark px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-4 py-2 rounded-full shadow-soft transition-all flex items-center gap-1.5"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-sage-light text-sage-dark px-3.5 py-1.5 rounded-full text-xs font-bold border border-line mb-5">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Unified Recurring Billing, Quotations &amp; Offers Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink leading-[1.15]">
            Run plans, subscriptions and recurring billing in one place.
          </h1>

          <p className="text-sm sm:text-base text-ink-muted mt-5 leading-relaxed max-w-2xl mx-auto">
            The digital backbone for subscription businesses. Build quotation proposals from pre-set templates, apply dynamic discount rules, run automated billing runs, and empower customers with self-service controls.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-6 py-3.5 rounded-full shadow-elevated flex items-center justify-center gap-2 transition-all"
            >
              <span>Get Started as Customer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#plans"
              className="w-full sm:w-auto bg-canvas-card hover:bg-white text-ink border border-line text-xs font-bold px-6 py-3.5 rounded-full shadow-soft flex items-center justify-center transition-all"
            >
              Browse Subscription Plans
            </a>
          </div>
        </div>

        {/* Hero Visual Preview Card */}
        <div className="mt-12 bg-canvas-card rounded-2xl p-6 sm:p-8 shadow-elevated border border-line max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-xl bg-sage-light/60 border border-line">
              <div className="w-8 h-8 rounded-full bg-sage-dark text-white flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">Template-Driven Quotes</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Sales reps launch proposals in seconds. Pre-filled plans, product variants, and automated 18% GST tax calculation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sage-light/60 border border-line">
              <div className="w-8 h-8 rounded-full bg-sage-dark text-white flex items-center justify-center mb-3">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">Automated Billing Day</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                One-click batch invoice compilation for all due subscriptions. Zero manual typing, duplicate prevention, and clean auditing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sage-light/60 border border-line">
              <div className="w-8 h-8 rounded-full bg-sage-dark text-white flex items-center justify-center mb-3">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">Customer Self-Service</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                Customers view active subscriptions, pause/resume, review quotations, and settle bills with downloadable receipts in ₹.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Subscription Plans Section */}
      <section id="plans" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-line">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Subscription Plans &amp; Pricing
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">
            Flexible recurring packages billed daily, weekly, monthly, or yearly with transparent Indian Rupee (₹) pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p, idx) => (
            <div 
              key={p.id} 
              className={`bg-canvas-card rounded-2xl p-6 shadow-soft border flex flex-col justify-between transition-all hover:shadow-elevated ${
                idx === 1 ? 'border-sage-dark ring-2 ring-sage-primary/20' : 'border-line'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-sage-light text-sage-dark px-2.5 py-1 rounded-full border border-line">
                    {p.billing_frequency}
                  </span>
                  {idx === 1 && (
                    <span className="text-[10px] font-bold bg-sage-dark text-white px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-ink">{p.name}</h3>
                <p className="text-xs text-ink-muted mt-1">Product: {p.product_name || 'Business Suite'}</p>

                <div className="mt-4 mb-5">
                  <span className="text-2xl font-extrabold text-ink">₹{p.cost?.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-ink-muted font-medium"> / {p.billing_frequency}</span>
                </div>

                <ul className="space-y-2 text-xs text-ink-muted mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark shrink-0" />
                    <span>Min {p.min_quantity} user seat(s)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark shrink-0" />
                    <span>{p.can_pause ? 'Self-service pause permitted' : 'Fixed contract duration'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark shrink-0" />
                    <span>{p.can_renew ? 'Automatic or 1-click renewal' : 'Non-renewable pass'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark shrink-0" />
                    <span>Standard GST 18% included at checkout</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/register"
                className={`w-full py-2.5 rounded-full text-xs font-bold text-center transition-all ${
                  idx === 1
                    ? 'bg-sage-dark text-white hover:bg-sage-deep shadow-sm'
                    : 'bg-sage-light text-sage-dark hover:bg-sage-dark hover:text-white border border-line'
                }`}
              >
                Choose {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Offers & Discount Rules Preview */}
      <section id="offers" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-line">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-sage-light text-sage-dark px-3 py-1 rounded-full text-xs font-bold border border-line mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>Special Incentives</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Active Discount Offers
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">
            Discount rules automatically applied by staff when preparing your personalized quotation proposals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {discounts.map((d) => (
            <div key={d.id} className="bg-canvas-card rounded-2xl p-6 shadow-soft border border-line flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold bg-sage-light text-sage-dark px-2.5 py-0.5 rounded border border-line">
                    {d.code}
                  </span>
                  <h3 className="font-bold text-sm text-ink">{d.name}</h3>
                </div>
                <p className="text-xs text-ink-muted mt-2">
                  Min Purchase: ₹{d.min_purchase?.toLocaleString('en-IN')} · Seats: {d.min_quantity}+
                </p>
                <p className="text-[11px] text-ink-subtle mt-0.5">
                  Valid until {d.end_date || 'December 31, 2026'} · Usage limit: {d.times_used}/{d.usage_limit} claimed
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-extrabold text-sage-dark">
                  {d.rule_type === 'percentage' ? `${d.discount_value}% OFF` : `-₹${d.discount_value}`}
                </span>
                <span className="text-[10px] block font-semibold text-ink-muted">On Next Invoice</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Features & Benefits */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-line">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Built for Modern Teams
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">
            Three interconnected portals engineered for administrative control, sales efficiency, and smooth customer experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-canvas-card rounded-2xl p-6 shadow-soft border border-line">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-sage-dark" />
              Admin Portal
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Launch product catalogs, assign brand variants (including Odoo brand +₹560), manage billing frequencies, set tax rules, provision staff accounts, and monitor MRR with sub-second performance.
            </p>
          </div>

          <div className="bg-canvas-card rounded-2xl p-6 shadow-soft border border-line">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-sage-dark" />
              Staff Portal
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Build quotation offers from pre-set templates, transition subscriptions across the 5-stage lifecycle (Draft → Quotation → Confirmed → Active → Closed), and execute automated billing runs.
            </p>
          </div>

          <div className="bg-canvas-card rounded-2xl p-6 shadow-soft border border-line">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-sage-dark" />
              Customer Portal
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Self-service subscription management, 1-click quotation offer acceptance, itemized tax breakdowns with 18% GST, verified payments, and downloadable receipts.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-canvas-card border-t border-line py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">Brightloop Software</span>
            <span>· Subscription, Offers &amp; Quotation Management</span>
          </div>
          <p>© 2026 Brightloop. All rights reserved. Prices in Indian Rupees (₹).</p>
        </div>
      </footer>
    </div>
  );
}
