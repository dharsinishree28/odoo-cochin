import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  CheckCircle2, 
  Pause, 
  Play, 
  RefreshCw, 
  FileText, 
  Printer, 
  Check, 
  X,
  ShieldCheck,
  Calendar,
  Tag,
  ArrowRight,
  Receipt,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Layers,
  Crown,
  Lock,
  ExternalLink,
  DollarSign,
  TrendingUp,
  User,
  Building,
  Mail,
  Phone
} from 'lucide-react';

// Static Curated Offers catalog with tier requirements
export const CURATED_OFFERS = [
  {
    id: 1,
    productId: 1,
    name: "Brightloop Enterprise ERP Suite",
    category: "Enterprise SaaS",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    description: "Complete all-in-one business software suite featuring multi-currency accounting, automated inventory, recurring sales pipelines, and financial ledger.",
    features: [
      "Unified Accounting & Real-Time GST Invoicing",
      "Automated Multi-Warehouse Inventory Tracking",
      "Odoo Brand Variant Integration (+$560 Value)",
      "Daily Automated Offsite Cloud Backups"
    ],
    originalPrice: 1200.0,
    discountPct: 15,
    requiredPlan: "Basic Plan",
    requiredTierRank: 1,
    validity: "Valid until Dec 31, 2026"
  },
  {
    id: 2,
    productId: 2,
    name: "CRM & Lead Automation Pipeline",
    category: "Sales Automation",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80",
    description: "Accelerate deal flow with automated customer tracking, instant quotation pipelines, email open tracking, and scheduled follow-up triggers.",
    features: [
      "Visual Kanban Deal Flow & Stage Automation",
      "Real-Time Email Open & Click Tracking",
      "Direct Odoo Sync Connector Integration",
      "Performance KPIs & Sales Team Dashboards"
    ],
    originalPrice: 600.0,
    discountPct: 20,
    requiredPlan: "Pro Plan",
    requiredTierRank: 2,
    validity: "Valid until Dec 31, 2026"
  },
  {
    id: 3,
    productId: 4,
    name: "Dedicated High-Availability Cloud Cluster",
    category: "Cloud Infrastructure",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    description: "Enterprise isolated cloud cluster with dedicated compute resources, multi-zone automated disaster recovery, zero noisy neighbors, and enterprise security.",
    features: [
      "99.99% Guaranteed SLA with 1-Hour Resolution",
      "Dedicated High-IOPS NVMe Storage Instances",
      "Isolated Virtual Private Cloud (VPC) & Firewalls",
      "24/7 Dedicated SRE Monitoring & Health Checks"
    ],
    originalPrice: 350.0,
    discountPct: 25,
    requiredPlan: "Premium Plan",
    requiredTierRank: 3,
    validity: "Valid until Nov 30, 2026"
  },
  {
    id: 4,
    productId: 3,
    name: "Enterprise Expansion Team Pack (10 Seats)",
    category: "Team Expansion",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    description: "Expand your organization seamlessly with a pack of 10 fully licensed user accounts featuring customized permissions, role segregation, and audit trails.",
    features: [
      "10 Licensed Team User Accounts",
      "Granular Admin, Staff, & Reviewer Roles",
      "Complete Audit Logging & History Tracking",
      "Instant Provisioning with One-Click Onboarding"
    ],
    originalPrice: 450.0,
    discountPct: 30,
    requiredPlan: "Pro Plan",
    requiredTierRank: 2,
    validity: "Valid until Dec 31, 2026"
  }
];

export default function CustomerPortal({ activeNav = 'dashboard', offerId = null, onNavigate }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Modals
  const [confirmPlanModal, setConfirmPlanModal] = useState(null);
  const [planSubscribing, setPlanSubscribing] = useState(false);
  const [quoteSuccessModal, setQuoteSuccessModal] = useState(null);
  const [quoteRequesting, setQuoteRequesting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const offersSectionRef = useRef(null);

  useEffect(() => {
    loadCustomerData();
  }, [user]);

  async function loadCustomerData() {
    if (!user) return;
    setLoading(true);
    try {
      const [subs, quotes, invs, pl, d] = await Promise.all([
        api.getSubscriptions({ customer_id: user.id }),
        api.getQuotations({ customer_id: user.id }),
        api.getInvoices({ customer_id: user.id }),
        api.getPlans(true),
        api.getDiscounts()
      ]);
      setSubscriptions(subs || []);
      setQuotations(quotes || []);
      setInvoices(invs || []);
      setPlans(pl || []);
      setDiscounts(d || []);
    } catch (err) {
      console.warn("Customer data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 5000);
  }

  // Active Subscription
  const activeSub = subscriptions.find(s => s.status === 'Active');

  // Customer's plan tier rank (0=None, 1=Basic, 2=Pro, 3=Premium)
  function getPlanTierRank(planName) {
    if (!planName) return 0;
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('yearly') || name.includes('enterprise')) return 3;
    if (name.includes('pro') || name.includes('starter') || name.includes('business')) return 2;
    if (name.includes('basic') || name.includes('trial') || name.includes('pass')) return 1;
    return 1;
  }

  const currentTierRank = activeSub ? getPlanTierRank(activeSub.plan_name) : 0;

  // Pricing cards configuration
  const tieredPlans = [
    {
      id: 3, // Matches Basic Plan in database
      name: "Basic Plan",
      subtitle: "Entry-level subscription",
      cost: 350.0,
      frequency: "monthly",
      validity: "Monthly Billing (Renewable)",
      badge: "Starter",
      offerEligibilityText: "Eligible for Basic Tier Offers (up to 15% off)",
      tierRank: 1,
      benefits: [
        "1 Active Business Software License",
        "Up to 3 Team User Accounts",
        "Basic Offers & Standard Quotations",
        "Standard Email Support (48h SLA)",
        "Daily Cloud Sync & Backups"
      ]
    },
    {
      id: 1, // Matches Pro Plan in database
      name: "Pro Plan",
      subtitle: "Mid-tier professional SaaS package",
      cost: 1200.0,
      frequency: "monthly",
      validity: "Monthly Billing (Auto-Renewable)",
      badge: "Most Popular",
      isPopular: true,
      offerEligibilityText: "Eligible for Basic & Pro Offers (up to 20% off)",
      tierRank: 2,
      benefits: [
        "Core ERP Suite & CRM Automation",
        "Odoo Brand Variant Included (+$560 Value)",
        "Up to 10 Team Seats Included",
        "Priority Operations Support (24h SLA)",
        "Automated Batch Billing Day Runs",
        "Pro & Basic Exclusive Offers Access"
      ]
    },
    {
      id: 2, // Matches Premium Plan in database
      name: "Premium Plan",
      subtitle: "Highest-tier enterprise subscription",
      cost: 12500.0,
      frequency: "yearly",
      validity: "Annual Contract (Prepaid 12 Months)",
      badge: "Enterprise",
      offerEligibilityText: "Access to 100% of All Offers (up to 30% off)",
      tierRank: 3,
      benefits: [
        "Full Enterprise Business Management Suite",
        "Dedicated High-Availability Cloud Cluster",
        "Unlimited Team Seats & Multi-Company Support",
        "1-Hour Critical SLA & Dedicated Account Manager",
        "VIP Access to ALL Platform Offers",
        "Custom Line Items & Full Audit Trails"
      ]
    }
  ];

  // Handle plan confirmation & activation
  async function handleConfirmSubscription() {
    if (!confirmPlanModal) return;
    setPlanSubscribing(true);
    try {
      const res = await api.subscribePlan({
        customer_id: user.id,
        plan_id: confirmPlanModal.id
      });
      showToast(res.message || `Successfully activated ${confirmPlanModal.name}!`);
      setConfirmPlanModal(null);
      await loadCustomerData();
      if (onNavigate) onNavigate('dashboard');
    } catch (err) {
      alert(err.message || "Failed to activate subscription");
    } finally {
      setPlanSubscribing(false);
    }
  }

  // Handle quotation request for an offer
  async function handleRequestQuotationForOffer(offer) {
    if (quoteRequesting) return;
    setQuoteRequesting(true);

    const discountAmount = Math.round(offer.originalPrice * (offer.discountPct / 100) * 100) / 100;
    const priceAfterDiscount = Math.round((offer.originalPrice - discountAmount) * 100) / 100;
    const taxAmount = Math.round(priceAfterDiscount * 0.18 * 100) / 100;
    const finalAmount = Math.round((priceAfterDiscount + taxAmount) * 100) / 100;

    try {
      const res = await api.requestCustomerQuote({
        customer_id: user.id,
        product_id: offer.productId,
        offer_id: offer.id,
        offer_title: offer.name,
        original_price: offer.originalPrice,
        discount_pct: offer.discountPct,
        discount_amount: discountAmount,
        unit_price: priceAfterDiscount,
        tax_rate: 18.0,
        tax_amount: taxAmount,
        total_amount: finalAmount,
        notes: `Customer request for ${offer.name} with ${offer.discountPct}% subscription discount.`
      });

      setQuoteSuccessModal({
        quoteNumber: res.quote_number,
        offerName: offer.name,
        finalAmount: finalAmount,
        date: new Date().toLocaleDateString('en-IN')
      });
      showToast(`Quotation ${res.quote_number} requested successfully!`);
      await loadCustomerData();
    } catch (err) {
      alert(err.message || "Failed to submit quotation request");
    } finally {
      setQuoteRequesting(false);
    }
  }

  // Payment process
  async function handleProcessPayment(invoice) {
    setPaymentProcessing(true);
    try {
      const res = await api.recordPayment({
        invoice_id: invoice.id,
        amount: invoice.total_amount - invoice.paid_amount,
        method: 'Credit Card',
        note: `Online Settlement by ${user.full_name}`
      });

      const receipt = {
        receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceNumber: invoice.invoice_number,
        date: new Date().toLocaleDateString('en-IN'),
        amount: invoice.total_amount - invoice.paid_amount,
        txnRef: res.transaction_ref || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        planName: invoice.notes || "Subscription Service",
        customerName: user.full_name,
        customerEmail: user.email
      };

      setSelectedReceipt(receipt);
      setCheckoutInvoice(null);
      showToast(`Payment settled! Receipt ${receipt.receiptNumber} generated.`);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    } finally {
      setPaymentProcessing(false);
    }
  }

  // Pause / Resume subscription
  async function handleTogglePause(subId) {
    try {
      const res = await api.togglePauseSub(subId);
      showToast(res.message);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Renew subscription
  async function handleRenew(subId) {
    try {
      const res = await api.renewSub(subId);
      showToast(res.message);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scroll to available offers
  function scrollToOffers() {
    if (offersSectionRef.current) {
      offersSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Filter pending quotes and completed purchases
  const pendingQuotes = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft' || q.status === 'Pending');
  const paidInvoices = invoices.filter(i => i.status === 'Paid');

  // Find target offer for offer-details view
  const currentOffer = CURATED_OFFERS.find(o => String(o.id) === String(offerId)) || CURATED_OFFERS[0];

  return (
    <div className="space-y-8 font-sans antialiased text-ink">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-sage-dark text-white p-4 rounded-2xl shadow-elevated border border-sage-deep flex items-center justify-between gap-3 animate-slide-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CUSTOMER DASHBOARD (Route: /customer/dashboard)                         */}
      {/* ========================================================================= */}
      {activeNav === 'dashboard' && (
        <div className="space-y-8">
          
          {/* A. Welcome Banner */}
          <div className="bg-gradient-to-r from-[#2A3B31] via-[#3D5647] to-[#25352B] rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 border border-white/20 text-emerald-200">
                <Sparkles className="w-3 h-3" />
                Customer Workspace
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
                Welcome back, {user?.full_name || 'Valued Subscriber'}!
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-2 font-medium leading-relaxed">
                Manage your active cloud subscription, explore tier-eligible software offers, and review your quotations and payment history in one place.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <button
                  onClick={() => onNavigate && onNavigate('plans')}
                  className="bg-white hover:bg-sage-light text-sage-dark hover:text-sage-deep font-bold text-xs px-5 py-2.5 rounded-full shadow-soft transition-all flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Choose Subscription</span>
                </button>
                <button
                  onClick={scrollToOffers}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-2.5 rounded-full border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <Tag className="w-4 h-4" />
                  <span>View Offers</span>
                </button>
              </div>
            </div>

            {/* Ambient Graphic / Quick Badge */}
            <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 text-center min-w-[200px]">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest block">Membership Status</span>
              <p className="text-lg font-extrabold text-white mt-1">
                {activeSub ? activeSub.plan_name : 'No Active Plan'}
              </p>
              <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-2 ${
                activeSub ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
              }`}>
                {activeSub ? (activeSub.is_paused ? 'Paused' : 'Active Subscriber') : 'Guest Access'}
              </span>
            </div>

            {/* Ambient Background Circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-sage-light/10 blur-3xl pointer-events-none" />
          </div>

          {/* B. Dashboard Statistics (4 Summary Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Current Subscription */}
            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-light text-sage-dark flex items-center justify-center shrink-0 border border-line">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Current Subscription</span>
                <p className="text-base sm:text-lg font-extrabold text-ink truncate mt-0.5">
                  {activeSub ? activeSub.plan_name : 'None'}
                </p>
                <span className="text-[10px] text-ink-subtle block truncate">
                  {activeSub ? `Expires: ${activeSub.expiry_date}` : 'Select a plan to start'}
                </span>
              </div>
            </div>

            {/* 2. Available Offers */}
            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-light text-sage-dark flex items-center justify-center shrink-0 border border-line">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Available Offers</span>
                <p className="text-base sm:text-lg font-extrabold text-ink mt-0.5">
                  {CURATED_OFFERS.length} Offers
                </p>
                <span className="text-[10px] text-sage-dark font-semibold block truncate">
                  {CURATED_OFFERS.filter(o => currentTierRank >= o.requiredTierRank).length} unlocked with your tier
                </span>
              </div>
            </div>

            {/* 3. Pending Quotations */}
            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-light text-sage-dark flex items-center justify-center shrink-0 border border-line">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Pending Quotations</span>
                <p className="text-base sm:text-lg font-extrabold text-ink mt-0.5">
                  {pendingQuotes.length} Pending
                </p>
                <span className="text-[10px] text-ink-subtle block truncate">Awaiting staff review</span>
              </div>
            </div>

            {/* 4. Completed Purchases */}
            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-light text-sage-dark flex items-center justify-center shrink-0 border border-line">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Completed Purchases</span>
                <p className="text-base sm:text-lg font-extrabold text-ink mt-0.5">
                  {paidInvoices.length} Orders
                </p>
                <span className="text-[10px] text-status-successText font-semibold block truncate">Verified Receipts Ready</span>
              </div>
            </div>
          </div>

          {/* C. Current Subscription Details Section */}
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-3 mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-ink tracking-tight">Current Subscription</h3>
                <p className="text-xs text-ink-muted mt-0.5">Your active software plan details and renewal management</p>
              </div>
              {activeSub ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate && onNavigate('plans')}
                    className="bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs px-4 py-2 rounded-full shadow-soft transition-all"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => handleTogglePause(activeSub.id)}
                    className="bg-canvas hover:bg-white text-ink text-xs font-semibold px-3 py-2 rounded-full border border-line transition-all"
                  >
                    {activeSub.is_paused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => handleRenew(activeSub.id)}
                    className="bg-canvas hover:bg-white text-ink text-xs font-semibold px-3 py-2 rounded-full border border-line transition-all"
                  >
                    Extend
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate && onNavigate('plans')}
                  className="bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-soft transition-all flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Choose Plan</span>
                </button>
              )}
            </div>

            {activeSub ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-canvas/40 rounded-2xl border border-line">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Active Plan</span>
                  <p className="text-xl font-extrabold text-ink mt-1">{activeSub.plan_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-successBg text-status-successText border border-status-successText/20">
                      {activeSub.is_paused ? 'Paused' : 'Active'}
                    </span>
                    <span className="text-xs text-ink-muted capitalize">Cycle: {activeSub.billing_cycle}</span>
                  </div>
                </div>

                <div className="p-4 bg-canvas/40 rounded-2xl border border-line">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Validity Period</span>
                  <p className="text-xs font-bold text-ink mt-1">Start Date: <span className="font-normal text-ink-muted">{activeSub.start_date}</span></p>
                  <p className="text-xs font-bold text-ink mt-1">Expiry Date: <span className="font-normal text-ink-muted">{activeSub.expiry_date}</span></p>
                  <p className="text-[11px] text-sage-dark font-semibold mt-2">Auto-renewal enabled</p>
                </div>

                <div className="p-4 bg-canvas/40 rounded-2xl border border-line">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Included Plan Benefits</span>
                  <ul className="mt-2 space-y-1 text-xs text-ink font-medium">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sage-dark" /> Enterprise Cloud Suite Access</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sage-dark" /> Quotation Proposal Requests</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sage-dark" /> Priority Customer Support</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-canvas/30 rounded-2xl border border-dashed border-line">
                <AlertCircle className="w-10 h-10 text-ink-subtle mx-auto mb-2" />
                <h4 className="text-base font-bold text-ink">No Active Subscription</h4>
                <p className="text-xs text-ink-muted max-w-md mx-auto mt-1 mb-4">
                  You currently have no active subscription. Choose a plan to unlock exclusive discounted offers and automatic quotation generation.
                </p>
                <button
                  onClick={() => onNavigate && onNavigate('plans')}
                  className="bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-soft transition-all"
                >
                  Choose a Subscription Plan
                </button>
              </div>
            )}
          </div>

          {/* D. Available Offers (Displayed directly on Customer Dashboard) */}
          <div ref={offersSectionRef} id="available-offers" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
                  <span>Available Offers &amp; Special Packages</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sage-light text-sage-dark border border-line">
                    {CURATED_OFFERS.length} Deals
                  </span>
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Exclusive software bundles and extensions unlocked based on your subscription tier
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {CURATED_OFFERS.map((offer) => {
                const isEligible = currentTierRank >= offer.requiredTierRank;
                const discountAmt = Math.round(offer.originalPrice * (offer.discountPct / 100));
                const finalPrice = offer.originalPrice - discountAmt;

                return (
                  <div 
                    key={offer.id}
                    className="bg-canvas-card rounded-2xl border border-line shadow-soft overflow-hidden flex flex-col justify-between hover:shadow-elevated transition-all duration-200 group"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img 
                          src={offer.image} 
                          alt={offer.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {offer.category}
                        </div>
                        <div className="absolute top-2.5 right-2.5 bg-status-alertBg text-status-alertText border border-status-alertText/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-soft">
                          {offer.discountPct}% OFF
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-ink line-clamp-1 group-hover:text-sage-dark transition-colors">
                            {offer.name}
                          </h4>
                          <p className="text-[11px] text-ink-muted line-clamp-2 mt-1">
                            {offer.description}
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="pt-2 border-t border-line flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-ink-subtle line-through mr-1.5">${offer.originalPrice.toFixed(2)}</span>
                            <span className="text-lg font-black text-ink">${finalPrice.toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] text-ink-subtle">+18% GST</span>
                        </div>

                        {/* Eligibility Pill */}
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-ink-muted block uppercase tracking-wider">Required Plan:</span>
                          <span className="text-xs font-semibold text-ink">{offer.requiredPlan}</span>
                          
                          <div className="mt-2">
                            {isEligible ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-status-successText bg-status-successBg px-2 py-0.5 rounded-full border border-status-successText/20">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Eligible with your tier
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Lock className="w-3 h-3" />
                                Requires {offer.requiredPlan}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => onNavigate && onNavigate(`offers/${offer.id}`)}
                        className="w-full bg-canvas hover:bg-sage-dark hover:text-white text-ink text-xs font-bold py-2.5 rounded-xl border border-line transition-all flex items-center justify-center gap-1.5 group-hover:border-sage-dark"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* E. Pending Quotations Table */}
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-ink tracking-tight">Pending Quotations</h3>
                <p className="text-xs text-ink-muted mt-0.5">Active requests currently being prepared or awaiting your approval</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('quotations')}
                className="text-xs font-bold text-sage-dark hover:underline flex items-center gap-1"
              >
                <span>View All ({quotations.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {pendingQuotes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line text-ink-muted">
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Quotation ID</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Product / Offer</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Requested Date</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Total Amount</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {pendingQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-canvas/30 transition-colors">
                        <td className="py-3.5 font-bold text-ink">{q.quote_number}</td>
                        <td className="py-3.5 font-semibold text-ink">{q.template_name || q.lines?.[0]?.product_name || 'Software Offer'}</td>
                        <td className="py-3.5 text-ink-muted">{q.created_at ? q.created_at.split(' ')[0] : '2026-10-31'}</td>
                        <td className="py-3.5 font-extrabold text-ink">${q.total_amount?.toFixed(2)}</td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onNavigate && onNavigate('quotations')}
                            className="bg-white hover:bg-sage-dark hover:text-white text-ink text-xs font-bold px-3 py-1.5 rounded-lg border border-line transition-all shadow-soft"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-ink-muted text-xs bg-canvas/30 rounded-2xl border border-line">
                <FileText className="w-8 h-8 text-ink-subtle mx-auto mb-1.5" />
                <p className="font-semibold text-ink">No Pending Quotations</p>
                <p className="text-[11px] text-ink-subtle mt-0.5">Browse available offers above to request customized proposals.</p>
              </div>
            )}
          </div>

          {/* F. Completed Purchases */}
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-ink tracking-tight">Completed Purchases &amp; Orders</h3>
                <p className="text-xs text-ink-muted mt-0.5">Settled invoices with verified digital receipts</p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate('history')}
                className="text-xs font-bold text-sage-dark hover:underline flex items-center gap-1"
              >
                <span>View History</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {paidInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line text-ink-muted">
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Order ID</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Product / Service</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Final Amount</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Payment Status</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {paidInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-canvas/30 transition-colors">
                        <td className="py-3.5 font-bold text-ink">{inv.invoice_number}</td>
                        <td className="py-3.5 font-medium text-ink">{inv.notes || 'Subscription Billing Settlement'}</td>
                        <td className="py-3.5 font-extrabold text-ink">${inv.total_amount?.toFixed(2)}</td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-status-successBg text-status-successText border border-status-successText/20">
                            <Check className="w-3 h-3" />
                            Paid &amp; Settled
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setSelectedReceipt({
                              receiptNumber: `RCPT-${inv.invoice_number.replace('INV-', '')}`,
                              invoiceNumber: inv.invoice_number,
                              date: inv.issue_date || '2026-10-31',
                              amount: inv.total_amount,
                              txnRef: `TXN-REF-${inv.id * 8921}`,
                              planName: inv.notes || "Subscription Software License",
                              customerName: user.full_name,
                              customerEmail: user.email
                            })}
                            className="bg-white hover:bg-sage-dark hover:text-white text-ink text-xs font-bold px-3 py-1.5 rounded-lg border border-line transition-all shadow-soft flex items-center gap-1.5 ml-auto"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-ink-muted text-xs bg-canvas/30 rounded-2xl border border-line">
                <Receipt className="w-8 h-8 text-ink-subtle mx-auto mb-1.5" />
                <p className="font-semibold text-ink">No Completed Purchases Yet</p>
                <p className="text-[11px] text-ink-subtle mt-0.5">Purchases and paid invoices will be documented here with downloadable receipts.</p>
              </div>
            )}
          </div>

          {/* G. Recent Activity */}
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft space-y-4">
            <h3 className="text-lg font-extrabold text-ink tracking-tight">Recent Activity Timeline</h3>
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-status-successBg text-status-successText flex items-center justify-center shrink-0 border border-status-successText/20 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">
                    {activeSub ? `Subscription Active: ${activeSub.plan_name}` : 'Workspace Initialized'}
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {activeSub ? `Your plan is fully provisioned and active until ${activeSub.expiry_date}.` : 'Account authenticated and ready to choose a plan.'}
                  </p>
                  <span className="text-[10px] text-ink-subtle block mt-1">2026-10-31 • Cloud System Event</span>
                </div>
              </div>

              {pendingQuotes.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Quotation Requested ({pendingQuotes[0].quote_number})</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">Offer proposal sent to staff for review and approval.</p>
                    <span className="text-[10px] text-ink-subtle block mt-1">Today • Quotation Workflow</span>
                  </div>
                </div>
              )}

              {paidInvoices.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-light text-sage-dark flex items-center justify-center shrink-0 border border-line text-xs">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Payment Completed &amp; Receipt Generated</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Invoice {paidInvoices[0].invoice_number} settled for ${paidInvoices[0].total_amount.toFixed(2)}.
                    </p>
                    <span className="text-[10px] text-ink-subtle block mt-1">Latest Billing Cycle</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHOOSE SUBSCRIPTION PAGE (Route: /customer/plans)                       */}
      {/* ========================================================================= */}
      {activeNav === 'plans' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sage-light text-sage-dark border border-line">
              Choose Subscription
            </span>
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Select Your Business Plan
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Activate recurring software licenses and unlock tier-eligible quotation offers with automated billing.
            </p>
          </div>

          {/* Three Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {tieredPlans.map((plan) => {
              const isCurrent = activeSub && activeSub.plan_name.toLowerCase().includes(plan.name.toLowerCase().split(' ')[0]);

              return (
                <div
                  key={plan.id}
                  className={`bg-canvas-card rounded-3xl p-6 sm:p-8 border shadow-soft flex flex-col justify-between relative transition-all duration-300 ${
                    plan.isPopular 
                      ? 'border-2 border-sage-dark shadow-elevated ring-1 ring-sage-dark/20' 
                      : 'border-line hover:border-line-dark'
                  }`}
                >
                  {/* Popular Highlight Badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sage-dark text-white px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-soft flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-sage-dark uppercase tracking-wider">
                        {plan.badge}
                      </span>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-status-successBg text-status-successText border border-status-successText/20">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-ink">{plan.name}</h3>
                    <p className="text-xs text-ink-muted mt-1 leading-snug">{plan.subtitle}</p>

                    {/* Price */}
                    <div className="my-6 pb-6 border-b border-line">
                      <div className="flex items-baseline">
                        <span className="text-3xl sm:text-4xl font-black text-ink">${plan.cost.toFixed(2)}</span>
                        <span className="text-xs font-bold text-ink-muted ml-1.5">/ {plan.frequency}</span>
                      </div>
                      <span className="text-[11px] text-ink-subtle mt-1 block">{plan.validity}</span>
                    </div>

                    {/* Offer Eligibility Tag */}
                    <div className="p-3 bg-canvas/60 rounded-xl border border-line mb-5">
                      <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Offer Eligibility</span>
                      <p className="text-xs font-bold text-sage-dark mt-0.5">{plan.offerEligibilityText}</p>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Included Benefits:</span>
                      {plan.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-ink font-medium">
                          <Check className="w-4 h-4 text-sage-dark shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8 pt-4">
                    <button
                      onClick={() => setConfirmPlanModal(plan)}
                      disabled={isCurrent}
                      className={`w-full py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-soft flex items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-canvas text-ink-muted border border-line cursor-default'
                          : plan.isPopular
                            ? 'bg-sage-dark hover:bg-sage-deep text-white'
                            : 'bg-white hover:bg-sage-dark hover:text-white text-ink border border-line'
                      }`}
                    >
                      <span>{isCurrent ? 'Current Plan' : 'Select Plan'}</span>
                      {!isCurrent && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OFFER DETAILS PAGE (Route: /customer/offers/:id)                        */}
      {/* ========================================================================= */}
      {activeNav === 'offer-details' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Back Navigation Button */}
          <button
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="flex items-center gap-2 text-xs font-bold text-sage-dark hover:underline py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Main Offer Card */}
          <div className="bg-canvas-card rounded-3xl border border-line shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Col: Image & Badges */}
            <div className="lg:col-span-5 relative bg-slate-100 flex flex-col justify-between p-6 overflow-hidden min-h-[340px]">
              <img 
                src={currentOffer.image} 
                alt={currentOffer.name} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                  {currentOffer.category}
                </span>
                <span className="bg-status-alertBg text-status-alertText border border-status-alertText/20 px-3 py-1 rounded-full text-xs font-black shadow-soft">
                  {currentOffer.discountPct}% DISCOUNT
                </span>
              </div>

              <div className="relative z-10 text-white">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">Special Promotion</span>
                <h3 className="text-xl font-black leading-tight text-white mt-1">{currentOffer.name}</h3>
                <span className="text-xs text-white/80 block mt-1">{currentOffer.validity}</span>
              </div>
            </div>

            {/* Right Col: Product Info, Pricing Breakdown & Eligibility */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div>
                {/* Product Info */}
                <div>
                  <h2 className="text-2xl font-black text-ink">{currentOffer.name}</h2>
                  <p className="text-xs text-ink-muted leading-relaxed mt-2">
                    {currentOffer.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="my-5 pt-4 border-t border-line">
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-2">
                    Key Features Included:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentOffer.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-ink font-medium">
                        <Check className="w-3.5 h-3.5 text-sage-dark shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Breakdown */}
                {(() => {
                  const discountAmt = Math.round(currentOffer.originalPrice * (currentOffer.discountPct / 100) * 100) / 100;
                  const priceAfterDisc = Math.round((currentOffer.originalPrice - discountAmt) * 100) / 100;
                  const taxAmt = Math.round(priceAfterDisc * 0.18 * 100) / 100;
                  const finalAmount = Math.round((priceAfterDisc + taxAmt) * 100) / 100;

                  const isEligible = currentTierRank >= currentOffer.requiredTierRank;

                  return (
                    <div className="space-y-5">
                      <div className="p-4 bg-canvas/40 rounded-2xl border border-line space-y-2">
                        <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                          Dynamic Pricing Breakdown
                        </span>
                        
                        <div className="flex justify-between text-xs text-ink">
                          <span>Original Price:</span>
                          <span className="font-semibold">${currentOffer.originalPrice.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-xs text-status-successText font-semibold">
                          <span>Subscription Discount ({currentOffer.discountPct}%):</span>
                          <span>-${discountAmt.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-xs text-ink">
                          <span>Price After Discount:</span>
                          <span className="font-semibold">${priceAfterDisc.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-xs text-ink">
                          <span>Applicable Tax (18% GST):</span>
                          <span className="font-semibold">+${taxAmt.toFixed(2)}</span>
                        </div>

                        <div className="pt-2 border-t border-line flex justify-between items-baseline">
                          <span className="text-sm font-extrabold text-ink">Final Payable Amount:</span>
                          <span className="text-xl font-black text-sage-dark">${finalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Subscription Eligibility Check */}
                      <div className="p-4 rounded-2xl border border-line bg-canvas/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Subscription Eligibility</span>
                          <p className="text-xs font-semibold text-ink mt-0.5">
                            Required: <strong className="text-sage-dark">{currentOffer.requiredPlan}</strong> • Your Plan: <strong>{activeSub?.plan_name || 'No Active Plan'}</strong>
                          </p>
                        </div>

                        <div>
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-status-successBg text-status-successText border border-status-successText/20">
                              <Check className="w-3.5 h-3.5" />
                              Eligible for this offer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Lock className="w-3.5 h-3.5" />
                              Upgrade Required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button: Request Quote or Upgrade */}
                      <div>
                        {isEligible ? (
                          <button
                            onClick={() => handleRequestQuotationForOffer(currentOffer)}
                            disabled={quoteRequesting}
                            className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-sm py-3.5 rounded-full shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {quoteRequesting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Submitting Quotation Request...</span>
                              </>
                            ) : (
                              <>
                                <span>Request Quotation</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => onNavigate && onNavigate('plans')}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-3.5 rounded-full shadow-soft transition-all flex items-center justify-center gap-2"
                            >
                              <span>Upgrade Subscription to Unlock This Offer</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <p className="text-[11px] text-center text-ink-muted">
                              This offer requires an active {currentOffer.requiredPlan} tier or higher.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MY QUOTATIONS SECTION (Route: /customer/quotations)                     */}
      {/* ========================================================================= */}
      {activeNav === 'quotations' && (
        <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="text-xl font-extrabold text-ink tracking-tight">My Quotations</h3>
              <p className="text-xs text-ink-muted mt-0.5">Review, approve, and convert your proposals into active subscriptions</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="bg-canvas hover:bg-white text-ink text-xs font-bold px-4 py-2 rounded-full border border-line"
            >
              Browse More Offers
            </button>
          </div>

          {quotations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-muted">
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Quote #</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Offer / Plan</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Requested Date</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Validity</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Total Amount</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="py-4 font-bold text-ink">{q.quote_number}</td>
                      <td className="py-4 font-semibold text-ink">{q.template_name || 'Software Offer'}</td>
                      <td className="py-4 text-ink-muted">{q.created_at ? q.created_at.split(' ')[0] : '2026-10-31'}</td>
                      <td className="py-4 text-ink-muted">{q.valid_days || 30} Days</td>
                      <td className="py-4 font-black text-ink">${q.total_amount?.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === 'Accepted'
                            ? 'bg-status-successBg text-status-successText border border-status-successText/20'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {q.status === 'Accepted' ? 'Accepted & Active' : 'Pending Review'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {q.status !== 'Accepted' ? (
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.convertToSubscription(q.id);
                                showToast(`Quotation approved! Subscription ${res.subscription_number} is active.`);
                                loadCustomerData();
                              } catch (err) {
                                alert(err.message);
                              }
                            }}
                            className="bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-soft transition-all"
                          >
                            Accept &amp; Activate
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-status-successText">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-ink-muted text-xs bg-canvas/30 rounded-2xl border border-line">
              <FileText className="w-10 h-10 text-ink-subtle mx-auto mb-2" />
              <p className="font-bold text-ink text-sm">No Quotations Yet</p>
              <p className="text-xs text-ink-subtle mt-1 mb-4">You have not submitted any quotation requests.</p>
              <button
                onClick={() => onNavigate && onNavigate('dashboard')}
                className="bg-sage-dark text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-soft"
              >
                Explore Available Offers
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. BILLING & PAYMENTS (Route: /customer/billing)                           */}
      {/* ========================================================================= */}
      {activeNav === 'billing' && (
        <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="text-xl font-extrabold text-ink tracking-tight">Billing &amp; Payments</h3>
              <p className="text-xs text-ink-muted mt-0.5">Outstanding recurring invoices and payment settlement</p>
            </div>
          </div>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-ink-muted">
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Invoice #</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Details</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Issue Date</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Due Date</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="py-4 font-bold text-ink">{inv.invoice_number}</td>
                      <td className="py-4 font-medium text-ink">{inv.notes || 'Subscription Billing'}</td>
                      <td className="py-4 text-ink-muted">{inv.issue_date}</td>
                      <td className="py-4 text-ink-muted">{inv.due_date}</td>
                      <td className="py-4 font-black text-ink">${inv.total_amount?.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-status-successBg text-status-successText border border-status-successText/20'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {inv.status !== 'Paid' ? (
                          <button
                            onClick={() => setCheckoutInvoice(inv)}
                            className="bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-soft"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedReceipt({
                              receiptNumber: `RCPT-${inv.invoice_number.replace('INV-', '')}`,
                              invoiceNumber: inv.invoice_number,
                              date: inv.issue_date,
                              amount: inv.total_amount,
                              txnRef: `TXN-${inv.id * 921}`,
                              planName: inv.notes || "Subscription Software License",
                              customerName: user.full_name,
                              customerEmail: user.email
                            })}
                            className="text-sage-dark hover:underline font-bold text-xs"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-ink-muted py-6 text-center">No invoices found for your account.</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PAYMENT RECEIPTS (Route: /customer/receipts)                           */}
      {/* ========================================================================= */}
      {activeNav === 'receipts' && (
        <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="text-xl font-extrabold text-ink tracking-tight">Payment Receipts</h3>
              <p className="text-xs text-ink-muted mt-0.5">Verified digital proofs of payment for subscriptions and offers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidInvoices.map((inv) => (
              <div key={inv.id} className="p-5 bg-canvas/40 rounded-2xl border border-line flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider">Settled Receipt</span>
                    <span className="text-xs font-bold text-status-successText">✓ Paid</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-ink">{inv.notes || 'Plan Subscription'}</h4>
                  <p className="text-xs text-ink-muted mt-1">Invoice: {inv.invoice_number}</p>
                  <p className="text-xs text-ink-muted">Settlement Date: {inv.issue_date}</p>
                  <p className="text-base font-black text-ink mt-3">${inv.total_amount?.toFixed(2)}</p>
                </div>

                <button
                  onClick={() => setSelectedReceipt({
                    receiptNumber: `RCPT-${inv.invoice_number.replace('INV-', '')}`,
                    invoiceNumber: inv.invoice_number,
                    date: inv.issue_date,
                    amount: inv.total_amount,
                    txnRef: `TXN-${inv.id * 921}`,
                    planName: inv.notes || "Subscription Software License",
                    customerName: user.full_name,
                    customerEmail: user.email
                  })}
                  className="mt-4 w-full bg-white hover:bg-sage-dark hover:text-white text-ink text-xs font-bold py-2 rounded-xl border border-line transition-all shadow-soft flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Printable Receipt</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PURCHASE HISTORY (Route: /customer/history)                            */}
      {/* ========================================================================= */}
      {activeNav === 'history' && (
        <div className="bg-canvas-card rounded-3xl p-6 sm:p-7 border border-line shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <div>
              <h3 className="text-xl font-extrabold text-ink tracking-tight">Purchase History</h3>
              <p className="text-xs text-ink-muted mt-0.5">Historical log of all settled transactions and activations</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-muted">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Reference</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Description</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Date</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paidInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3.5 font-bold text-ink">{inv.invoice_number}</td>
                    <td className="py-3.5 text-ink">{inv.notes || 'Subscription Activation'}</td>
                    <td className="py-3.5 text-ink-muted">{inv.issue_date}</td>
                    <td className="py-3.5 font-black text-ink">${inv.total_amount?.toFixed(2)}</td>
                    <td className="py-3.5 font-bold text-status-successText">Completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MY PROFILE (Route: /customer/profile)                                  */}
      {/* ========================================================================= */}
      {activeNav === 'profile' && (
        <div className="bg-canvas-card rounded-3xl p-6 sm:p-8 border border-line shadow-soft max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-line">
            <div className="w-16 h-16 rounded-2xl bg-sage-dark text-white font-black text-2xl flex items-center justify-center shadow-soft">
              {user?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">{user?.full_name}</h3>
              <p className="text-xs text-ink-muted">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sage-light text-sage-dark border border-line">
                Customer Account
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-canvas/40 rounded-xl border border-line">
              <Mail className="w-4 h-4 text-ink-subtle" />
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase">Email Address</span>
                <p className="text-xs font-semibold text-ink">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-canvas/40 rounded-xl border border-line">
              <Building className="w-4 h-4 text-ink-subtle" />
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase">Company Name</span>
                <p className="text-xs font-semibold text-ink">{user?.company_name || 'Individual Customer'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-canvas/40 rounded-xl border border-line">
              <Phone className="w-4 h-4 text-ink-subtle" />
              <div>
                <span className="text-[10px] font-bold text-ink-muted uppercase">Phone</span>
                <p className="text-xs font-semibold text-ink">{user?.phone || '+91 98400 33003'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM SUBSCRIPTION PLAN SELECTION                                */}
      {/* ========================================================================= */}
      {confirmPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-line shadow-elevated space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-[10px] font-bold text-sage-dark uppercase tracking-wider block">Confirm Plan Selection</span>
                <h3 className="text-xl font-black text-ink">{confirmPlanModal.name}</h3>
              </div>
              <button 
                onClick={() => setConfirmPlanModal(null)}
                className="w-8 h-8 rounded-full bg-canvas text-ink-subtle hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-canvas/40 rounded-2xl border border-line space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Base Subscription:</span>
                <span className="font-bold text-ink">${confirmPlanModal.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Billing Cycle:</span>
                <span className="font-semibold text-ink capitalize">{confirmPlanModal.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Applicable Tax (18% GST):</span>
                <span className="font-semibold text-ink">+${(confirmPlanModal.cost * 0.18).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-line flex justify-between items-baseline font-black">
                <span className="text-sm text-ink">Total Payable:</span>
                <span className="text-lg text-sage-dark">${(confirmPlanModal.cost * 1.18).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-ink-muted">
              <p className="font-bold text-ink">Activation Details:</p>
              <p>• Immediate activation in demo mode with pre-approved test checkout.</p>
              <p>• Updates your offer eligibility ranking immediately.</p>
              <p>• Persistent in database and across sessions.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPlanModal(null)}
                className="flex-1 bg-canvas hover:bg-white text-ink text-xs font-bold py-3 rounded-full border border-line"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubscription}
                disabled={planSubscribing}
                className="flex-1 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-3 rounded-full shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {planSubscribing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Confirm &amp; Activate</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUOTATION REQUEST SUCCESS CONFIRMATION                             */}
      {/* ========================================================================= */}
      {quoteSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-line shadow-elevated text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-status-successBg text-status-successText flex items-center justify-center mx-auto border border-status-successText/20">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <h3 className="text-xl font-black text-ink">Quotation Request Submitted!</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your quotation request for <strong>{quoteSuccessModal.offerName}</strong> has been registered with reference:
            </p>

            <div className="p-3 bg-canvas/60 rounded-xl border border-line">
              <span className="text-[10px] font-bold text-ink-muted uppercase block">Quote Reference ID</span>
              <p className="text-lg font-black text-sage-dark">{quoteSuccessModal.quoteNumber}</p>
              <span className="text-[11px] text-ink-subtle">Total: ${quoteSuccessModal.finalAmount.toFixed(2)} (Incl. 18% GST)</span>
            </div>

            <p className="text-[11px] text-ink-muted">
              Staff has been notified. You can track this proposal under <strong>My Quotations</strong>.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setQuoteSuccessModal(null);
                  if (onNavigate) onNavigate('quotations');
                }}
                className="flex-1 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-3 rounded-full shadow-soft"
              >
                View in My Quotations
              </button>
              <button
                onClick={() => setQuoteSuccessModal(null)}
                className="flex-1 bg-canvas hover:bg-white text-ink text-xs font-bold py-3 rounded-full border border-line"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIGITAL PAYMENT RECEIPT                                            */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-line shadow-elevated space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sage-dark" />
                <h3 className="text-lg font-black text-ink">Payment Receipt</h3>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="w-7 h-7 rounded-full bg-canvas text-ink-subtle hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 bg-canvas/30 rounded-2xl border border-dashed border-line space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-line">
                <p className="text-xs font-bold uppercase tracking-wider text-sage-dark">Brightloop Software Ltd</p>
                <p className="text-[10px] text-ink-subtle">Odoo Cochin Enterprise Billing</p>
                <p className="text-base font-black text-ink mt-1">${selectedReceipt.amount?.toFixed(2)}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-status-successText bg-status-successBg px-2 py-0.5 rounded-full">
                  Status: Payment Settled
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Receipt Number:</span>
                  <span className="font-bold text-ink">{selectedReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Invoice Ref:</span>
                  <span className="font-semibold text-ink">{selectedReceipt.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Transaction ID:</span>
                  <span className="font-mono text-[11px] text-ink">{selectedReceipt.txnRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Date &amp; Time:</span>
                  <span className="text-ink">{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Customer:</span>
                  <span className="text-ink font-semibold">{selectedReceipt.customerName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-2.5 rounded-full shadow-soft flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-canvas hover:bg-white text-ink text-xs font-bold py-2.5 rounded-full border border-line"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BILLING CHECKOUT                                                   */}
      {/* ========================================================================= */}
      {checkoutInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-canvas-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-line shadow-elevated space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-lg font-black text-ink">Settle Invoice</h3>
              <button 
                onClick={() => setCheckoutInvoice(null)}
                className="w-7 h-7 rounded-full bg-canvas text-ink-subtle hover:text-ink flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-canvas/40 rounded-2xl border border-line space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Invoice Number:</span>
                <span className="font-bold text-ink">{checkoutInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Outstanding Amount:</span>
                <span className="text-base font-black text-sage-dark">
                  ${(checkoutInvoice.total_amount - checkoutInvoice.paid_amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-ink block">Payment Method</label>
              <div className="p-3 bg-white rounded-xl border border-sage-dark flex items-center justify-between text-xs font-bold text-ink shadow-soft">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sage-dark" />
                  <span>Credit Card (Demo Simulator)</span>
                </div>
                <span className="text-status-successText text-[11px]">Instant Clearance</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCheckoutInvoice(null)}
                className="flex-1 bg-canvas hover:bg-white text-ink text-xs font-bold py-3 rounded-full border border-line"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleProcessPayment(checkoutInvoice)}
                disabled={paymentProcessing}
                className="flex-1 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-3 rounded-full shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {paymentProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Pay &amp; Generate Receipt</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
