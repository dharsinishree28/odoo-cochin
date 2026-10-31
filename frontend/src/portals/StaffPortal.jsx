import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  FileText, 
  RefreshCw, 
  ArrowRight, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Send, 
  Check, 
  Clock, 
  AlertCircle,
  Play
} from 'lucide-react';

export default function StaffPortal() {
  const [activeTab, setActiveTab] = useState('quotes');
  const [quotations, setQuotations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

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
    unit_price: 1200,
    discount_code: 'TEAM10',
    notes: 'Quotation valid for 30 days.'
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  }

  // Scene 3: Sales rep prepares offer and creates quote
  async function handleCreateQuote(e) {
    e.preventDefault();
    try {
      const prod = products.find(p => p.id === parseInt(newQuote.product_id)) || products[0];
      const variant = prod?.variants?.find(v => v.id === parseInt(newQuote.variant_id));
      const unitPrice = (prod?.sales_price || 1200) + (variant?.price_extra || 0);

      const payload = {
        customer_id: parseInt(newQuote.customer_id),
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
      flash(`Quotation ${res.quote_number} generated from template and sent to customer!`);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 3: Convert quote into a subscription
  async function handleConvertToSub(quoteId) {
    try {
      const res = await api.convertToSubscription(quoteId);
      flash(`Quotation converted! Created Subscription ${res.subscription_number} in Confirmed state.`);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 3: Subscription lifecycle transitions: Draft -> Quotation -> Confirmed -> Active -> Closed
  async function handleUpdateSubStatus(subId, newStatus) {
    try {
      await api.updateSubStatus(subId, newStatus);
      flash(`Subscription updated to status: "${newStatus}"`);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 4: Billing Day batch run
  async function handleBillingDayRun() {
    try {
      const res = await api.runBatchBilling();
      flash(`Billing Day Complete: ${res.message}`);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 4: Update invoice status
  async function handleUpdateInvoiceStatus(invId, status) {
    try {
      await api.updateInvoiceStatus(invId, status);
      flash(`Invoice #${invId} updated to ${status}`);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 6: Record incoming payment
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
      flash(`Payment recorded (${res.transaction_ref}). Invoice status: ${res.invoice_status}`);
      setSelectedInvoice(null);
      setPaymentData({ amount: '', method: 'Bank Transfer', note: '' });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMsg && (
        <div className="bg-sage-light text-sage-deep px-4 py-3 rounded-2xl flex items-center gap-2 border border-sage-border shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-sage-deep shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-[#E2E6E3] pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'quotes', label: 'Quotation Builder (Scene 3)', icon: FileText },
            { id: 'subscriptions', label: 'Subscription Lifecycle', icon: RefreshCw },
            { id: 'billing', label: 'Billing Day Invoices (Scene 4 & 6)', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sage-deep text-white shadow-sm'
                    : 'bg-white text-slate-muted hover:text-charcoal border border-[#E2E6E3]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scene 4: Billing Day One-Click Action */}
        {activeTab === 'billing' && (
          <button
            onClick={handleBillingDayRun}
            className="flex items-center gap-2 bg-[#557761] hover:bg-sage-deep text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all"
            title="Automatically generates invoices for all due active subscriptions"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute Billing Day Run</span>
          </button>
        )}
      </div>

      {/* 1. QUOTATION BUILDER TAB (Scene 3) */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Form */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-sage-deep" />
              Prepare Offer (Template Driven)
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              "Instead of building it from scratch, they start from a quotation template that already has the right plan and product lines."
            </p>

            <form onSubmit={handleCreateQuote} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-charcoal">Customer</label>
                <select
                  value={newQuote.customer_id}
                  onChange={(e) => setNewQuote({ ...newQuote, customer_id: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs font-medium text-charcoal focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.company_name || 'Individual'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Quotation Template</label>
                <select
                  value={newQuote.template_name}
                  onChange={(e) => setNewQuote({ ...newQuote, template_name: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs font-medium text-charcoal focus:outline-none"
                >
                  <option value="Standard SaaS Subscription Offer">Standard SaaS Subscription Offer</option>
                  <option value="Enterprise Annual Proposal">Enterprise Annual Proposal</option>
                  <option value="High-Growth Team Pilot">High-Growth Team Pilot</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal">Subscription Plan</label>
                  <select
                    value={newQuote.plan_id}
                    onChange={(e) => setNewQuote({ ...newQuote, plan_id: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.cost})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Validity (Days)</label>
                  <input
                    type="number"
                    value={newQuote.valid_days}
                    onChange={(e) => setNewQuote({ ...newQuote, valid_days: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Product and Variant Line Item */}
              <div className="p-3 bg-sage-light/50 border border-sage-border rounded-2xl space-y-2">
                <label className="text-xs font-bold text-sage-deep">Product &amp; Variant Line</label>
                <select
                  value={newQuote.product_id}
                  onChange={(e) => setNewQuote({ ...newQuote, product_id: e.target.value })}
                  className="w-full bg-white border border-[#E2E6E3] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {products.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name} - ${pr.sales_price}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newQuote.variant_id}
                    onChange={(e) => setNewQuote({ ...newQuote, variant_id: e.target.value })}
                    className="w-full bg-white border border-[#E2E6E3] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="">Default / Standard</option>
                    {products.find(p => p.id === parseInt(newQuote.product_id))?.variants?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.variant_name} (+${v.price_extra})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newQuote.quantity}
                    onChange={(e) => setNewQuote({ ...newQuote, quantity: e.target.value })}
                    className="w-full bg-white border border-[#E2E6E3] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Discount Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. TEAM10 or EARLY250"
                  value={newQuote.discount_code}
                  onChange={(e) => setNewQuote({ ...newQuote, discount_code: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs uppercase font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sage-deep text-white font-semibold text-xs py-2.5 rounded-full hover:bg-sage-primary transition-all shadow-sm"
              >
                Send Quotation Offer
              </button>
            </form>
          </div>

          {/* Quotes List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal mb-4">Quotations &amp; Proposals ({quotations.length})</h3>
            <div className="space-y-3">
              {quotations.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sage-deep bg-sage-light px-2.5 py-0.5 rounded-md">
                          {q.quote_number}
                        </span>
                        <h4 className="font-bold text-sm text-charcoal">{q.customer_name}</h4>
                        {q.company_name && (
                          <span className="text-xs text-slate-muted">({q.company_name})</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-muted mt-1">{q.template_name} · Valid {q.valid_days} Days</p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-charcoal">
                        ${q.total_amount?.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-muted">
                        Subtotal: ${q.subtotal} | Tax: ${q.tax_amount}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="mt-4 pt-3 border-t border-[#EAEAE4] flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      q.status === 'Accepted'
                        ? 'bg-sage-light text-sage-deep'
                        : q.status === 'Sent'
                        ? 'bg-[#EBF1ED] text-charcoal'
                        : 'bg-[#F2F5F3] text-slate-muted'
                    }`}>
                      Status: {q.status}
                    </span>

                    {/* Turn Quote into Subscription CTA */}
                    {q.status !== 'Accepted' && (
                      <button
                        onClick={() => handleConvertToSub(q.id)}
                        className="inline-flex items-center gap-1.5 bg-sage-deep hover:bg-sage-primary text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm transition-all"
                      >
                        <span>Convert to Subscription</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBSCRIPTION LIFECYCLE TAB (Scene 3) */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-charcoal">Subscriptions Lifecycle</h3>
              <p className="text-xs text-slate-muted mt-0.5">
                "It moves from Draft to Quotation to Confirmed to Active and finally to Closed, and anyone on the team should be able to see where it stands."
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-muted bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#E2E6E3]">
              Total: {subscriptions.length} Subscriptions
            </span>
          </div>

          <div className="space-y-4">
            {subscriptions.map((s) => {
              const stages = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];
              const currentIdx = stages.indexOf(s.status);

              return (
                <div key={s.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sage-deep bg-white px-2.5 py-0.5 rounded-md border border-[#E2E6E3]">
                          {s.subscription_number}
                        </span>
                        <h4 className="font-bold text-sm text-charcoal">{s.customer_name}</h4>
                        <span className="text-xs text-slate-muted">({s.plan_name})</span>
                      </div>
                      <p className="text-xs text-slate-muted mt-1">
                        Billing: {s.billing_cycle} · Terms: {s.payment_terms} · Expiry: {s.expiry_date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-charcoal">
                        ${s.total_amount?.toFixed(2)}
                      </span>
                      <p className="text-[11px] text-slate-muted">Tax: ${s.tax_amount} | Disc: ${s.discount_amount}</p>
                    </div>
                  </div>

                  {/* Visual Stage Progress Stepper */}
                  <div className="grid grid-cols-5 gap-2 my-3">
                    {stages.map((stage, idx) => {
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <button
                          key={stage}
                          onClick={() => handleUpdateSubStatus(s.id, stage)}
                          className={`text-center py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all border ${
                            isCurrent
                              ? 'bg-sage-deep text-white border-sage-deep shadow-sm ring-2 ring-sage-light'
                              : isCompleted
                              ? 'bg-sage-light text-sage-deep border-sage-border'
                              : 'bg-white text-slate-subtle border-[#EAEAE4] hover:border-slate-muted'
                          }`}
                        >
                          {stage}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BILLING DAY INVOICES TAB (Scene 4 & 6) */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-charcoal">Billing Day Invoices ({invoices.length})</h3>
              <p className="text-xs text-slate-muted mt-0.5">
                "Each invoice moves from Draft to Confirmed to Paid. Nothing should be billed twice or skipped."
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-charcoal bg-white px-2.5 py-0.5 rounded-md border border-[#E2E6E3]">
                      {inv.invoice_number}
                    </span>
                    <h4 className="font-bold text-sm text-charcoal">{inv.customer_name}</h4>
                    <span className="text-xs text-slate-muted">({inv.company_name})</span>
                  </div>
                  <p className="text-xs text-slate-muted mt-1">
                    Issued: {inv.issue_date} · Due: {inv.due_date} · Subscription: {inv.subscription_number}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-charcoal">
                      ${inv.total_amount?.toFixed(2)}
                    </span>
                    <p className="text-[11px] text-slate-muted">
                      Paid: ${inv.paid_amount?.toFixed(2)}
                    </p>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    inv.status === 'Paid'
                      ? 'bg-sage-light text-sage-deep'
                      : inv.status === 'Confirmed'
                      ? 'bg-alert-rose text-alert-roseText'
                      : 'bg-white text-slate-muted border border-[#E2E6E3]'
                  }`}>
                    {inv.status}
                  </span>

                  {/* Actions: Confirm, Record Payment */}
                  <div className="flex items-center gap-2">
                    {inv.status === 'Draft' && (
                      <button
                        onClick={() => handleUpdateInvoiceStatus(inv.id, 'Confirmed')}
                        className="bg-charcoal text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-sage-deep transition-all"
                      >
                        Confirm
                      </button>
                    )}

                    {inv.status !== 'Paid' && (
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPaymentData({
                            amount: (inv.total_amount - inv.paid_amount).toFixed(2),
                            method: 'Bank Transfer',
                            note: `Settlement for ${inv.invoice_number}`
                          });
                        }}
                        className="bg-sage-deep text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-sage-primary transition-all shadow-sm"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Payment Modal (Scene 6) */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-[#E2E6E3] max-w-md w-full animate-fade-in">
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-sage-deep" />
              Record Payment (Scene 6)
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              "Each one needs to be recorded with its method, amount, date and a note, against the right invoice."
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#ECECE6]">
                <p className="text-xs text-slate-muted">Invoice</p>
                <p className="text-sm font-bold text-charcoal">
                  {selectedInvoice.invoice_number} · {selectedInvoice.customer_name}
                </p>
                <p className="text-xs text-sage-deep font-bold mt-1">
                  Total Due: ${(selectedInvoice.total_amount - selectedInvoice.paid_amount).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Amount Paid ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Payment Method</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Cash">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Payment Note &amp; Reference</label>
                <textarea
                  rows="2"
                  placeholder="Wire reference TXN-99841..."
                  value={paymentData.note}
                  onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="w-1/2 bg-[#FAF9F5] text-slate-muted hover:text-charcoal text-xs font-bold py-2.5 rounded-full border border-[#E2E6E3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sage-deep text-white text-xs font-bold py-2.5 rounded-full hover:bg-sage-primary shadow-sm"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
