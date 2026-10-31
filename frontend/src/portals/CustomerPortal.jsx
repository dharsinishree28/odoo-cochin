import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
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
  Calendar
} from 'lucide-react';

export default function CustomerPortal({ currentCustomer }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Customer ID from prop or default to Anna Jones (id: 3)
  const customerId = currentCustomer?.id || 3;

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  async function loadCustomerData() {
    setLoading(true);
    try {
      const [subs, quotes, invs] = await Promise.all([
        api.getSubscriptions({ customer_id: customerId }),
        api.getQuotations({ customer_id: customerId }),
        api.getInvoices({ customer_id: customerId })
      ]);
      setSubscriptions(subs);
      setQuotations(quotes);
      setInvoices(invs);
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

  // Self-service Pause / Resume
  async function handleTogglePause(subId) {
    try {
      const res = await api.togglePauseSub(subId);
      flash(res.message);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Self-service Renew
  async function handleRenew(subId) {
    try {
      const res = await api.renewSub(subId);
      flash(res.message);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Accept Quotation Offer (converts to subscription)
  async function handleAcceptOffer(quoteId) {
    try {
      const res = await api.convertToSubscription(quoteId);
      flash(`Offer accepted! New subscription ${res.subscription_number} is now active.`);
      loadCustomerData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Reject Offer
  async function handleRejectOffer(quoteId) {
    try {
      await api.updateQuoteStatus(quoteId, 'Rejected');
      flash(`Offer declined.`);
      loadCustomerData();
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

      {/* Customer Portal Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E6E3] pb-3">
        {[
          { id: 'subscriptions', label: `My Subscriptions (${subscriptions.length})`, icon: CreditCard },
          { id: 'offers', label: `Offers & Quotations (${quotations.length})`, icon: FileText },
          { id: 'invoices', label: `Invoices & Receipts (${invoices.length})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
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

      {/* 1. MY SUBSCRIPTIONS TAB */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#E2E6E3]">
              <p className="text-sm text-slate-muted">You have no active subscriptions yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((s) => (
                <div key={s.id} className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-sage-deep bg-sage-light px-2.5 py-0.5 rounded-full">
                        {s.subscription_number}
                      </span>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        s.status === 'Active'
                          ? 'bg-sage-light text-sage-deep'
                          : s.status === 'Confirmed'
                          ? 'bg-[#EBF1ED] text-charcoal'
                          : 'bg-[#FAF9F5] text-slate-muted border border-[#E2E6E3]'
                      }`}>
                        {s.is_paused ? 'Paused' : s.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-charcoal">{s.plan_name}</h3>
                    <p className="text-xs text-slate-muted mt-1">
                      Billing Cycle: <span className="font-semibold text-charcoal capitalize">{s.billing_cycle}</span>
                    </p>

                    <div className="my-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#ECECE6]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-muted">Next Renewal:</span>
                        <span className="font-bold text-charcoal">{s.expiry_date}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-2">
                        <span className="text-slate-muted">Recurring Amount:</span>
                        <span className="text-base font-extrabold text-charcoal">${s.total_amount?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Line Items */}
                    {s.lines?.length > 0 && (
                      <div className="space-y-1.5 text-xs text-slate-muted">
                        {s.lines.map((l) => (
                          <div key={l.id} className="flex justify-between">
                            <span>{l.quantity}x {l.product_name} {l.variant_name && `(${l.variant_name})`}</span>
                            <span className="font-semibold text-charcoal">${l.line_total}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Self Service Actions */}
                  <div className="mt-6 pt-4 border-t border-[#F0F3F1] flex items-center justify-between gap-3">
                    {s.can_pause && (
                      <button
                        onClick={() => handleTogglePause(s.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#FAF9F5] hover:bg-white text-charcoal border border-[#E2E6E3] text-xs font-bold py-2 rounded-full transition-all"
                      >
                        {s.is_paused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                        <span>{s.is_paused ? 'Resume' : 'Pause'}</span>
                      </button>
                    )}

                    {s.can_renew && (
                      <button
                        onClick={() => handleRenew(s.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-sage-deep hover:bg-sage-primary text-white text-xs font-bold py-2 rounded-full transition-all shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Extend Renewal</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. OFFERS & QUOTATIONS TAB */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal mb-4">Received Quotations &amp; Special Offers</h3>
            <div className="space-y-4">
              {quotations.map((q) => (
                <div key={q.id} className="p-5 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sage-deep bg-white px-2.5 py-0.5 rounded-md border border-[#E2E6E3]">
                        {q.quote_number}
                      </span>
                      <h4 className="font-bold text-sm text-charcoal">{q.template_name}</h4>
                    </div>
                    <p className="text-xs text-slate-muted mt-1 leading-relaxed">
                      {q.notes || 'Exclusive offer proposal tailored for your team.'}
                    </p>
                    <p className="text-[11px] text-slate-subtle mt-1">
                      Offer valid for {q.valid_days} days · Prepared by {q.staff_name || 'Brightloop Team'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-charcoal">
                        ${q.total_amount?.toFixed(2)}
                      </span>
                      {q.discount_amount > 0 && (
                        <p className="text-[11px] text-sage-deep font-bold">
                          Includes ${q.discount_amount} Discount!
                        </p>
                      )}
                    </div>

                    {q.status === 'Sent' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptOffer(q.id)}
                          className="flex items-center gap-1.5 bg-sage-deep hover:bg-sage-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Accept Offer</span>
                        </button>
                        <button
                          onClick={() => handleRejectOffer(q.id)}
                          className="flex items-center gap-1 bg-[#FAF9F5] hover:bg-white text-slate-muted hover:text-alert-roseText text-xs font-semibold px-3 py-2 rounded-full border border-[#E2E6E3]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-sage-light text-sage-deep">
                        {q.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. INVOICES & RECEIPTS TAB */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
          <h3 className="text-base font-bold text-charcoal mb-4">Invoices &amp; Payment Receipts</h3>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-charcoal bg-white px-2.5 py-0.5 rounded-md border border-[#E2E6E3]">
                      {inv.invoice_number}
                    </span>
                    <h4 className="font-bold text-sm text-charcoal">{inv.plan_name}</h4>
                  </div>
                  <p className="text-xs text-slate-muted mt-1">
                    Issued: {inv.issue_date} · Due: {inv.due_date}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-charcoal">
                      ${inv.total_amount?.toFixed(2)}
                    </span>
                    <p className="text-[11px] text-slate-muted">Tax: ${inv.tax_amount}</p>
                  </div>

                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    inv.status === 'Paid'
                      ? 'bg-sage-light text-sage-deep'
                      : 'bg-alert-rose text-alert-roseText'
                  }`}>
                    {inv.status}
                  </span>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-white hover:bg-[#FAF9F5] text-charcoal border border-[#E2E6E3] text-xs font-bold px-3.5 py-1.5 rounded-full transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
