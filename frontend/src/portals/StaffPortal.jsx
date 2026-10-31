import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  RefreshCw, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  Send, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  Play,
  User,
  DollarSign,
  Filter
} from 'lucide-react';

export default function StaffPortal({ activeNav = 'dashboard' }) {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Review & Approval state
  const [reviewingQuote, setReviewingQuote] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Payment Recording Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Bank Transfer',
    note: ''
  });

  // Quotation Builder Form
  const [newQuote, setNewQuote] = useState({
    customer_id: '',
    plan_id: '',
    template_name: 'Standard SaaS Subscription Offer',
    valid_days: 30,
    product_id: '',
    variant_id: '',
    quantity: 1,
    discount_code: 'TEAM10',
    notes: 'Quotation valid for 30 days.'
  });

  useEffect(() => {
    loadAllStaffData();
  }, []);

  async function loadAllStaffData() {
    setLoading(true);
    try {
      const [q, s, inv, prod, pl, cust] = await Promise.all([
        api.getQuotations(),
        api.getSubscriptions(),
        api.getInvoices(),
        api.getProducts(),
        api.getPlans(),
        api.getUsers('customer')
      ]);
      setQuotations(q);
      setSubscriptions(s);
      setInvoices(inv);
      setProducts(prod);
      setPlans(pl);
      setCustomers(cust);

      if (cust.length > 0 && !newQuote.customer_id) {
        setNewQuote(prev => ({
          ...prev,
          customer_id: cust[0].id,
          plan_id: pl[0]?.id || 1,
          product_id: prod[0]?.id || 1
        }));
      }
    } catch (err) {
      console.warn("Staff data load:", err);
    } finally {
      setLoading(false);
    }
  }

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  }

  // Create quotation
  async function handleCreateQuote(e) {
    e.preventDefault();
    try {
      const prod = products.find(p => p.id === parseInt(newQuote.product_id)) || products[0];
      const variant = prod?.variants?.find(v => v.id === parseInt(newQuote.variant_id));
      const unitPrice = (prod?.sales_price || 1200) + (variant?.price_extra || 0);

      const payload = {
        customer_id: parseInt(newQuote.customer_id),
        staff_id: user?.id || 2,
        plan_id: parseInt(newQuote.plan_id),
        template_name: newQuote.template_name,
        valid_days: parseInt(newQuote.valid_days),
        discount_code: newQuote.discount_code,
        notes: newQuote.notes,
        lines: [
          {
            product_id: prod.id,
            variant_id: variant?.id || null,
            quantity: parseInt(newQuote.quantity),
            unit_price: unitPrice,
            tax_rate: 18.0
          }
        ]
      };

      const res = await api.createQuotation(payload);
      flash(`Quotation ${res.quote_number} generated and sent to customer!`);
      loadAllStaffData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Approve quotation
  async function handleApprove(quoteId) {
    try {
      await api.updateQuoteStatus(quoteId, 'Accepted');
      const subRes = await api.convertToSubscription(quoteId);
      flash(`Quotation approved! Subscription ${subRes.subscription_number} generated.`);
      setReviewingQuote(null);
      loadAllStaffData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Reject quotation with reason
  async function handleReject(quoteId) {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejecting the quotation.");
      return;
    }
    try {
      await api.updateQuoteStatus(quoteId, 'Rejected');
      flash(`Quotation rejected with note: "${rejectReason}"`);
      setReviewingQuote(null);
      setRejectReason('');
      loadAllStaffData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Automated billing day
  async function handleBillingRun() {
    try {
      const res = await api.runBatchBilling();
      flash(res.message);
      loadAllStaffData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Record payment
  async function handleRecordPayment(e) {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await api.recordPayment({
        invoice_id: selectedInvoice.id,
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        note: paymentData.note
      });
      flash(`Payment recorded (Ref: ${res.transaction_ref}). Invoice status: ${res.invoice_status}`);
      setSelectedInvoice(null);
      setPaymentData({ amount: '', method: 'Bank Transfer', note: '' });
      loadAllStaffData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Filtered quotations for tracking
  const filteredQuotes = quotations.filter(q => {
    if (statusFilter === 'All') return true;
    return q.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="bg-sage-light text-sage-dark p-3.5 rounded-xl border border-line flex items-center gap-2 shadow-soft font-semibold text-xs">
          <CheckCircle2 className="w-4 h-4 text-sage-dark shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. DASHBOARD OVERVIEW */}
      {activeNav === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Assigned Requests</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">{quotations.length}</h3>
              <p className="text-[11px] text-sage-dark font-medium mt-1">Pending review: {quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length}</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Approved Quotations</p>
              <h3 className="text-2xl font-extrabold text-status-successText mt-1">
                {quotations.filter(q => q.status === 'Accepted').length}
              </h3>
              <p className="text-[11px] text-ink-subtle font-medium mt-1">Converted to active contracts</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Active Subscriptions</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">{subscriptions.length}</h3>
              <p className="text-[11px] text-sage-dark font-medium mt-1">5-stage lifecycle</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Pending Invoices</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">
                {invoices.filter(i => i.status !== 'Paid').length}
              </h3>
              <button
                onClick={handleBillingRun}
                className="mt-1 text-[11px] font-bold text-sage-dark hover:underline flex items-center gap-1"
              >
                <span>Run Batch Billing Day</span>
                <Play className="w-2.5 h-2.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Quick Review Queue */}
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-4">Pending Quotation Review Queue</h3>
            <div className="space-y-3">
              {quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sage-dark bg-white px-2 py-0.5 rounded border border-line">
                        {q.quote_number}
                      </span>
                      <h4 className="font-bold text-xs text-ink">{q.customer_name}</h4>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1">
                      Template: {q.template_name} · Valid {q.valid_days} Days
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-ink">₹{q.total_amount?.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => setReviewingQuote(q)}
                      className="bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-soft transition-all"
                    >
                      Review &amp; Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. QUOTATION REQUESTS */}
      {activeNav === 'requests' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
          <h3 className="text-base font-bold text-ink mb-4">Incoming Customer Quotation Requests</h3>
          <div className="space-y-3">
            {quotations.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sage-dark bg-white px-2 py-0.5 rounded border border-line">
                      {q.quote_number}
                    </span>
                    <h4 className="font-bold text-xs text-ink">{q.customer_name}</h4>
                    <span className="text-[11px] text-ink-muted">({q.customer_email})</span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{q.notes || 'Standard quotation request'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-ink">₹{q.total_amount?.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => setReviewingQuote(q)}
                    className="bg-white hover:bg-sage-light text-ink border border-line text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CREATE QUOTATION */}
      {activeNav === 'create' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft max-w-2xl">
          <h3 className="text-base font-bold text-ink mb-2">Create Quotation from Template</h3>
          <p className="text-xs text-ink-muted mb-4">
            Pre-load product variants, configure quantities, apply discount codes, and compute GST 18%.
          </p>

          <form onSubmit={handleCreateQuote} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-ink">Target Customer</label>
              <select
                value={newQuote.customer_id}
                onChange={(e) => setNewQuote({ ...newQuote, customer_id: e.target.value })}
                className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.company_name || 'Individual'}) - {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink">Quotation Template</label>
                <select
                  value={newQuote.template_name}
                  onChange={(e) => setNewQuote({ ...newQuote, template_name: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Standard SaaS Subscription Offer">Standard SaaS Subscription Offer</option>
                  <option value="Enterprise Annual Proposal">Enterprise Annual Proposal</option>
                  <option value="High-Growth Team Pilot">High-Growth Team Pilot</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Subscription Plan</label>
                <select
                  value={newQuote.plan_id}
                  onChange={(e) => setNewQuote({ ...newQuote, plan_id: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.cost})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product & Variant Line */}
            <div className="p-3 bg-sage-light/60 border border-line rounded-xl space-y-2">
              <label className="text-xs font-bold text-sage-dark">Product &amp; Variant Selection</label>
              <select
                value={newQuote.product_id}
                onChange={(e) => setNewQuote({ ...newQuote, product_id: e.target.value })}
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              >
                {products.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name} (Base: ₹{pr.sales_price})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newQuote.variant_id}
                  onChange={(e) => setNewQuote({ ...newQuote, variant_id: e.target.value })}
                  className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">Standard Edition (+₹0)</option>
                  {products.find(p => p.id === parseInt(newQuote.product_id))?.variants?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variant_name} (+₹{v.price_extra})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={newQuote.quantity}
                  onChange={(e) => setNewQuote({ ...newQuote, quantity: e.target.value })}
                  className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink">Offer Discount Code</label>
                <input
                  type="text"
                  placeholder="e.g. TEAM10"
                  value={newQuote.discount_code}
                  onChange={(e) => setNewQuote({ ...newQuote, discount_code: e.target.value.toUpperCase() })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink">Validity (Days)</label>
                <input
                  type="number"
                  value={newQuote.valid_days}
                  onChange={(e) => setNewQuote({ ...newQuote, valid_days: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-2.5 rounded-full shadow-soft transition-all"
            >
              Generate &amp; Dispatch Quotation
            </button>
          </form>
        </div>
      )}

      {/* 4. QUOTATION TRACKING */}
      {activeNav === 'tracking' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">Quotation Tracking Pipeline</h3>
              <p className="text-xs text-ink-muted">Filtered by status: Pending, Approved, Rejected, Completed</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Sent', 'Accepted', 'Rejected', 'Draft'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    statusFilter === f
                      ? 'bg-sage-dark text-white'
                      : 'bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuotes.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sage-dark bg-white px-2 py-0.5 rounded border border-line">
                      {q.quote_number}
                    </span>
                    <h4 className="font-bold text-xs text-ink">{q.customer_name}</h4>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1">{q.template_name} · Valid {q.valid_days} Days</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-ink">₹{q.total_amount?.toLocaleString('en-IN')}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    q.status === 'Accepted'
                      ? 'bg-status-successBg text-status-successText'
                      : q.status === 'Rejected'
                      ? 'bg-status-alertBg text-status-alertText'
                      : 'bg-sage-light text-sage-dark'
                  }`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MY PROFILE */}
      {activeNav === 'profile' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft max-w-md">
          <h3 className="text-base font-bold text-ink mb-4">Staff Profile</h3>
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-14 h-14 rounded-full bg-sage-light text-sage-dark font-extrabold text-xl flex items-center justify-center border border-line">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h4 className="font-bold text-base text-ink">{user?.full_name}</h4>
              <p className="text-xs text-ink-muted">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-sage-light text-sage-dark px-2.5 py-0.5 rounded-full border border-line uppercase">
                Internal Sales Staff
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Review & Approval Drawer/Modal */}
      {reviewingQuote && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas-card rounded-2xl p-6 shadow-elevated border border-line max-w-lg w-full">
            <h3 className="text-base font-bold text-ink mb-1">
              Review Quotation: {reviewingQuote.quote_number}
            </h3>
            <p className="text-xs text-ink-muted mb-4">Customer: {reviewingQuote.customer_name} ({reviewingQuote.customer_email})</p>

            <div className="p-3.5 bg-canvas rounded-xl border border-line space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Template:</span>
                <span className="font-bold text-ink">{reviewingQuote.template_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal:</span>
                <span className="font-bold text-ink">₹{reviewingQuote.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">GST Tax (18%):</span>
                <span className="font-bold text-ink">₹{reviewingQuote.tax_amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm">
                <span className="font-bold text-ink">Total Payable:</span>
                <span className="font-extrabold text-sage-dark">₹{reviewingQuote.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Rejection Reason (if rejecting)</label>
              <textarea
                rows="2"
                placeholder="Reason for disapproval..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setReviewingQuote(null)}
                className="flex-1 bg-canvas text-ink text-xs font-bold py-2.5 rounded-full border border-line"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleReject(reviewingQuote.id)}
                className="flex-1 bg-status-alertBg hover:bg-status-alertBg/80 text-status-alertText text-xs font-bold py-2.5 rounded-full"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleApprove(reviewingQuote.id)}
                className="flex-1 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-2.5 rounded-full shadow-soft"
              >
                Approve &amp; Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
