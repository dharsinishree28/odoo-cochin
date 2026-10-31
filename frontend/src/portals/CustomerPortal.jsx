import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';

export default function CustomerPortal({ activeNav = 'dashboard' }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Bill / Payment Checkout Modal
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);

  // Request Quotation Modal
  const [requestPlan, setRequestPlan] = useState(null);
  const [requestOffer, setRequestOffer] = useState(null);
  const [quoteNotes, setQuoteNotes] = useState('');

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
      setSubscriptions(subs);
      setQuotations(quotes);
      setInvoices(invs);
      setPlans(pl);
      setDiscounts(d);
    } catch (err) {
      console.warn("Customer data load:", err);
    } finally {
      setLoading(false);
    }
  }

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  }

  // Step 2 & 5: Customer chooses plan & requests quote
  async function handleRequestQuotation() {
    try {
      const plan = requestPlan || plans[0];
      const payload = {
        customer_id: user.id,
        plan_id: plan.id,
        template_name: `Request: ${plan.name}`,
        valid_days: 30,
        discount_code: requestOffer?.code || null,
        notes: quoteNotes || `Requested ${plan.name} by ${user.full_name}`,
        lines: [
          {
            product_id: plan.product_id || 1,
            quantity: plan.min_quantity || 1,
            unit_price: plan.cost || 1200,
            tax_rate: 18.0
          }
        ]
      };
      const res = await api.createQuotation(payload);
      flash(`Quotation request sent! Staff is reviewing request ${res.quote_number}.`);
      setRequestPlan(null);
      setRequestOffer(null);
      setQuoteNotes('');
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Step 7: Accept Approved Quotation
  async function handleAcceptQuotation(quoteId) {
    try {
      const res = await api.convertToSubscription(quoteId);
      flash(`Quotation accepted! Subscription ${res.subscription_number} is now active.`);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Step 11 & 12: Customer makes payment with verified backend check
  async function handleProcessPayment(invoice) {
    setPaymentProcessing(true);
    try {
      const res = await api.recordPayment({
        invoice_id: invoice.id,
        amount: invoice.total_amount - invoice.paid_amount,
        method: 'Credit Card',
        note: `Verified Online Payment by ${user.full_name}`
      });

      // Receipt object
      const receipt = {
        receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceNumber: invoice.invoice_number,
        date: new Date().toLocaleDateString('en-IN'),
        amount: invoice.total_amount - invoice.paid_amount,
        txnRef: res.transaction_ref,
        planName: invoice.plan_name,
        customerName: user.full_name,
        customerEmail: user.email
      };

      setPaymentSuccessReceipt(receipt);
      setCheckoutInvoice(null);
      flash(`Payment settled successfully! Receipt generated: ${receipt.receiptNumber}`);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    } finally {
      setPaymentProcessing(false);
    }
  }

  // Pause / Resume
  async function handleTogglePause(subId) {
    try {
      const res = await api.togglePauseSub(subId);
      flash(res.message);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Renew
  async function handleRenew(subId) {
    try {
      const res = await api.renewSub(subId);
      flash(res.message);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  const activeSub = subscriptions.find(s => s.status === 'Active');

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
          {/* Welcome Card & Active Subscription Summary */}
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-sage-light text-sage-dark px-2.5 py-0.5 rounded-full border border-line">
                Subscriber Workspace
              </span>
              <h2 className="text-xl font-bold text-ink mt-2">
                Welcome back, {user?.full_name}!
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {activeSub 
                  ? `Your subscription to "${activeSub.plan_name}" is active until ${activeSub.expiry_date}.` 
                  : 'You have no active subscription. Choose a plan below to get started.'}
              </p>
            </div>

            {activeSub && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePause(activeSub.id)}
                  className="bg-canvas hover:bg-white text-ink text-xs font-bold px-3.5 py-2 rounded-full border border-line transition-all"
                >
                  {activeSub.is_paused ? 'Resume Subscription' : 'Pause Subscription'}
                </button>
                <button
                  onClick={() => handleRenew(activeSub.id)}
                  className="bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-4 py-2 rounded-full shadow-soft transition-all"
                >
                  Extend Renewal
                </button>
              </div>
            )}
          </div>

          {/* Metrics in Indian Rupees ₹ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Active Subscriptions</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">
                {subscriptions.filter(s => s.status === 'Active').length}
              </h3>
              <p className="text-[11px] text-sage-dark font-medium mt-1">
                {activeSub ? `Renews on ${activeSub.expiry_date}` : 'No active renewal'}
              </p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Available Offers</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">{discounts.length}</h3>
              <p className="text-[11px] text-sage-dark font-medium mt-1">Exclusive discount rules</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Pending Quotations</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">
                {quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length}
              </h3>
              <p className="text-[11px] text-ink-subtle font-medium mt-1">Awaiting approval</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Pending Invoices</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">
                {invoices.filter(i => i.status !== 'Paid').length}
              </h3>
              <p className="text-[11px] text-status-alertText font-medium mt-1">
                {invoices.filter(i => i.status !== 'Paid').length > 0 ? 'Action required' : 'All clear'}
              </p>
            </div>
          </div>

          {/* Recent Invoices / Activity */}
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-4">Recent Invoices &amp; Billing History</h3>
            <div className="divide-y divide-line text-xs">
              {invoices.length === 0 ? (
                <p className="text-xs text-ink-muted py-3">No billing records yet.</p>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-sage-dark mr-2">{inv.invoice_number}</span>
                      <span className="font-semibold text-ink">{inv.plan_name}</span>
                      <span className="text-ink-muted ml-2">Issued: {inv.issue_date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-ink">₹{inv.total_amount?.toLocaleString('en-IN')}</span>
                      {inv.status === 'Paid' ? (
                        <span className="bg-status-successBg text-status-successText font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => setCheckoutInvoice(inv)}
                          className="bg-sage-dark hover:bg-sage-deep text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-soft"
                        >
                          View Bill &amp; Pay
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MY SUBSCRIPTION */}
      {activeNav === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-2">My Subscriptions ({subscriptions.length})</h3>
            <p className="text-xs text-ink-muted mb-4">
              Manage your active recurring plans, renewal dates, and self-service controls.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((s) => (
                <div key={s.id} className="p-5 rounded-xl border border-line bg-canvas/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-sage-dark bg-white px-2.5 py-0.5 rounded border border-line">
                        {s.subscription_number}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        s.status === 'Active' ? 'bg-status-successBg text-status-successText' : 'bg-canvas text-ink-muted border border-line'
                      }`}>
                        {s.is_paused ? 'Paused' : s.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-ink">{s.plan_name}</h4>
                    <p className="text-xs text-ink-muted mt-0.5">Billing Cycle: {s.billing_cycle}</p>

                    <div className="my-3 p-3 bg-white rounded-lg border border-line space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Renewal Date:</span>
                        <span className="font-bold text-ink">{s.expiry_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Amount:</span>
                        <span className="font-extrabold text-ink">₹{s.total_amount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center gap-2">
                    {s.can_pause && (
                      <button
                        onClick={() => handleTogglePause(s.id)}
                        className="flex-1 bg-white hover:bg-canvas text-ink text-xs font-bold py-1.5 rounded-full border border-line transition-all"
                      >
                        {s.is_paused ? 'Resume' : 'Pause'}
                      </button>
                    )}
                    {s.can_renew && (
                      <button
                        onClick={() => handleRenew(s.id)}
                        className="flex-1 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-1.5 rounded-full shadow-soft transition-all"
                      >
                        Renew Plan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Plans to Choose From */}
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-4">Available Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="p-5 rounded-xl border border-line bg-canvas/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sage-light text-sage-dark px-2 py-0.5 rounded-full border border-line">
                      {p.billing_frequency}
                    </span>
                    <h4 className="font-bold text-sm text-ink mt-2">{p.name}</h4>
                    <p className="text-xl font-extrabold text-ink mt-1">₹{p.cost?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-ink-muted mt-1">Minimum seats: {p.min_quantity}</p>
                  </div>

                  <button
                    onClick={() => {
                      setRequestPlan(p);
                      setRequestOffer(null);
                    }}
                    className="mt-4 w-full bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-2 rounded-full shadow-soft transition-all"
                  >
                    Request Quotation for {p.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. BROWSE OFFERS */}
      {activeNav === 'offers' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink">Browse Exclusive Offers &amp; Discounts</h3>
            <p className="text-xs text-ink-muted">Eligible promotion codes you can attach to your quotation requests.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discounts.map((d) => (
              <div key={d.id} className="p-5 rounded-xl border border-line bg-canvas/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold bg-sage-light text-sage-dark px-2.5 py-0.5 rounded border border-line">
                      {d.code}
                    </span>
                    <span className="text-sm font-extrabold text-sage-dark">
                      {d.rule_type === 'percentage' ? `${d.discount_value}% OFF` : `-₹${d.discount_value}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-ink">{d.name}</h4>
                  <p className="text-xs text-ink-muted mt-1">
                    Valid for orders with min ₹{d.min_purchase?.toLocaleString('en-IN')} purchase and {d.min_quantity}+ seats.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setRequestOffer(d);
                    setRequestPlan(plans[0]);
                  }}
                  className="mt-4 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-2 rounded-full shadow-soft transition-all"
                >
                  Apply Code to Quotation Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MY QUOTATIONS */}
      {activeNav === 'quotations' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft space-y-4">
          <h3 className="text-base font-bold text-ink">My Quotation Proposals ({quotations.length})</h3>
          <div className="space-y-3">
            {quotations.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sage-dark bg-white px-2 py-0.5 rounded border border-line">
                      {q.quote_number}
                    </span>
                    <h4 className="font-bold text-xs text-ink">{q.template_name}</h4>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">Valid for {q.valid_days} Days · Notes: {q.notes || 'None'}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-ink">₹{q.total_amount?.toLocaleString('en-IN')}</span>
                    <p className="text-[10px] text-ink-muted">GST 18% included</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    q.status === 'Accepted'
                      ? 'bg-status-successBg text-status-successText'
                      : q.status === 'Rejected'
                      ? 'bg-status-alertBg text-status-alertText'
                      : 'bg-sage-light text-sage-dark'
                  }`}>
                    {q.status}
                  </span>

                  {q.status === 'Sent' && (
                    <button
                      onClick={() => handleAcceptQuotation(q.id)}
                      className="bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-soft"
                    >
                      Accept Offer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PAYMENT HISTORY */}
      {activeNav === 'payments' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">Payment History &amp; Receipts</h3>
              <p className="text-xs text-ink-muted">Official receipts for verified settlements</p>
            </div>
          </div>

          <div className="space-y-3">
            {invoices.filter(i => i.status === 'Paid').length === 0 ? (
              <p className="text-xs text-ink-muted py-3">No paid receipts yet.</p>
            ) : (
              invoices.filter(i => i.status === 'Paid').map((inv) => (
                <div key={inv.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-sage-dark" />
                      <span className="font-mono font-bold text-xs text-ink">RCPT-2026-{inv.id}98</span>
                      <span className="text-xs font-semibold text-ink">· {inv.plan_name}</span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-1">Paid on: {inv.issue_date} · Invoice: {inv.invoice_number}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-ink">₹{inv.total_amount?.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => window.print()}
                      className="bg-white hover:bg-canvas text-ink text-xs font-bold px-3.5 py-1.5 rounded-full border border-line flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. MY PROFILE */}
      {activeNav === 'profile' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft max-w-md">
          <h3 className="text-base font-bold text-ink mb-4">Customer Account Profile</h3>
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-14 h-14 rounded-full bg-sage-light text-sage-dark font-extrabold text-xl flex items-center justify-center border border-line">
              {user?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h4 className="font-bold text-base text-ink">{user?.full_name}</h4>
              <p className="text-xs text-ink-muted">{user?.email}</p>
              <p className="text-xs text-ink-muted">{user?.phone || '+91 98765 43210'}</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-sage-light text-sage-dark px-2.5 py-0.5 rounded-full border border-line uppercase">
                {user?.company_name || 'Customer Account'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Request Quotation Modal */}
      {(requestPlan || requestOffer) && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas-card rounded-2xl p-6 shadow-elevated border border-line max-w-md w-full">
            <h3 className="text-base font-bold text-ink mb-1">Request Quotation Offer</h3>
            <p className="text-xs text-ink-muted mb-4">Staff will generate an official quotation with applied tax and discount.</p>

            <div className="p-3 bg-canvas rounded-xl border border-line text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-ink-muted">Plan:</span>
                <span className="font-bold text-ink">{requestPlan?.name || plans[0]?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Base Cost:</span>
                <span className="font-bold text-ink">₹{(requestPlan?.cost || plans[0]?.cost)?.toLocaleString('en-IN')}</span>
              </div>
              {requestOffer && (
                <div className="flex justify-between text-sage-dark font-bold">
                  <span>Attached Offer:</span>
                  <span>{requestOffer.code} ({requestOffer.discount_value}% OFF)</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Notes &amp; Requirements</label>
              <textarea
                rows="2"
                placeholder="Number of seats required, onboarding needs..."
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setRequestPlan(null);
                  setRequestOffer(null);
                }}
                className="w-1/2 bg-canvas text-ink text-xs font-bold py-2.5 rounded-full border border-line"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestQuotation}
                className="w-1/2 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-2.5 rounded-full shadow-soft"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Checkout Modal (Step 9 & 10) */}
      {checkoutInvoice && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas-card rounded-2xl p-6 shadow-elevated border border-line max-w-md w-full">
            <h3 className="text-base font-bold text-ink mb-1">Itemized Bill &amp; Settlement</h3>
            <p className="text-xs text-ink-muted mb-4">Invoice #{checkoutInvoice.invoice_number} · Due on {checkoutInvoice.due_date}</p>

            {/* Bill breakdown */}
            <div className="p-4 bg-canvas rounded-xl border border-line space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-ink-muted">Plan Package:</span>
                <span className="font-semibold text-ink">{checkoutInvoice.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Original Subtotal:</span>
                <span className="font-semibold text-ink">₹{checkoutInvoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {checkoutInvoice.discount_amount > 0 && (
                <div className="flex justify-between text-status-successText">
                  <span>Applied Discount:</span>
                  <span className="font-bold">-₹{checkoutInvoice.discount_amount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-muted">Taxable Amount:</span>
                <span className="font-semibold text-ink">₹{(checkoutInvoice.subtotal - checkoutInvoice.discount_amount)?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Applicable GST (18%):</span>
                <span className="font-semibold text-ink">₹{checkoutInvoice.tax_amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm font-extrabold text-ink">
                <span>Final Payable Amount:</span>
                <span className="text-sage-dark">₹{checkoutInvoice.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCheckoutInvoice(null)}
                className="w-1/2 bg-canvas text-ink text-xs font-bold py-2.5 rounded-full border border-line"
              >
                Close
              </button>
              <button
                type="button"
                disabled={paymentProcessing}
                onClick={() => handleProcessPayment(checkoutInvoice)}
                className="w-1/2 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-2.5 rounded-full shadow-soft transition-all"
              >
                {paymentProcessing ? 'Verifying...' : `Pay ₹${checkoutInvoice.total_amount?.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success & Receipt Modal */}
      {paymentSuccessReceipt && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-canvas-card rounded-2xl p-6 shadow-elevated border border-line max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-status-successBg text-status-successText flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-extrabold text-ink">Payment Verified</h3>
            <p className="text-xs text-ink-muted mt-1">Official settlement receipt generated and stored.</p>

            <div className="my-4 p-4 bg-canvas rounded-xl border border-line text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Receipt Number:</span>
                <span className="font-mono font-bold text-sage-dark">{paymentSuccessReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Transaction Ref:</span>
                <span className="font-mono text-ink">{paymentSuccessReceipt.txnRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Payment Date:</span>
                <span className="text-ink font-medium">{paymentSuccessReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Subscriber:</span>
                <span className="text-ink font-bold">{paymentSuccessReceipt.customerName}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm font-extrabold">
                <span className="text-ink">Amount Paid:</span>
                <span className="text-status-successText">₹{paymentSuccessReceipt.amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaymentSuccessReceipt(null)}
                className="w-1/2 bg-canvas text-ink text-xs font-bold py-2.5 rounded-full border border-line"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-1/2 bg-sage-dark hover:bg-sage-deep text-white text-xs font-bold py-2.5 rounded-full shadow-soft flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
