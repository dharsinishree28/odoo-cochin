import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Building2, 
  Plus, 
  Check, 
  Clock, 
  DollarSign, 
  Tag, 
  UserPlus, 
  AlertCircle,
  Percent,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function AdminPortal({ onRefreshStats }) {
  const [activeSubTab, setActiveSubTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [newProduct, setNewProduct] = useState({
    name: '',
    sales_price: '',
    cost_price: '',
    notes: '',
    brand: 'Brightloop',
    variant_name: 'Odoo Brand Integrated Edition',
    variant_extra: '560'
  });

  const [newPlan, setNewPlan] = useState({
    name: '',
    product_id: '',
    billing_frequency: 'monthly',
    cost: '',
    min_quantity: '1',
    auto_close: false,
    can_pause: true,
    can_renew: true
  });

  const [newDiscount, setNewDiscount] = useState({
    name: '',
    code: '',
    rule_type: 'percentage',
    discount_value: '',
    min_purchase: '0',
    min_quantity: '1',
    usage_limit: '100'
  });

  const [newStaff, setNewStaff] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    company_name: 'Brightloop Internal Team'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [p, pl, d, u] = await Promise.all([
        api.getProducts(),
        api.getPlans(),
        api.getDiscounts(),
        api.getUsers('staff')
      ]);
      setProducts(p);
      setPlans(pl);
      setDiscounts(d);
      setStaffUsers(u);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  function flashSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  // Scene 2: Launch Product & Variants (e.g. Odoo brand adds 560 to price)
  async function handleCreateProduct(e) {
    e.preventDefault();
    try {
      const payload = {
        name: newProduct.name,
        sales_price: parseFloat(newProduct.sales_price),
        cost_price: parseFloat(newProduct.cost_price || 0),
        notes: newProduct.notes,
        brand: newProduct.brand,
        variants: newProduct.variant_name ? [
          { variant_name: 'Standard Edition', price_extra: 0 },
          { variant_name: newProduct.variant_name, price_extra: parseFloat(newProduct.variant_extra || 0) }
        ] : []
      };
      await api.createProduct(payload);
      flashSuccess(`Product "${newProduct.name}" launched with variants!`);
      setNewProduct({
        name: '', sales_price: '', cost_price: '', notes: '', brand: 'Brightloop',
        variant_name: 'Odoo Brand Integrated Edition', variant_extra: '560'
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 2: Launch Plan (frequencies, auto-close, pause, renew)
  async function handleCreatePlan(e) {
    e.preventDefault();
    try {
      const payload = {
        name: newPlan.name,
        product_id: parseInt(newPlan.product_id) || (products[0]?.id || 1),
        billing_frequency: newPlan.billing_frequency,
        cost: parseFloat(newPlan.cost),
        min_quantity: parseInt(newPlan.min_quantity) || 1,
        auto_close: newPlan.auto_close,
        can_pause: newPlan.can_pause,
        can_renew: newPlan.can_renew
      };
      await api.createPlan(payload);
      flashSuccess(`Subscription Plan "${newPlan.name}" created!`);
      setNewPlan({
        name: '', product_id: '', billing_frequency: 'monthly', cost: '', min_quantity: '1',
        auto_close: false, can_pause: true, can_renew: true
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 5: Create Discount Rule
  async function handleCreateDiscount(e) {
    e.preventDefault();
    try {
      const payload = {
        name: newDiscount.name,
        code: newDiscount.code,
        rule_type: newDiscount.rule_type,
        discount_value: parseFloat(newDiscount.discount_value),
        min_purchase: parseFloat(newDiscount.min_purchase || 0),
        min_quantity: parseInt(newDiscount.min_quantity || 1),
        usage_limit: parseInt(newDiscount.usage_limit || 100)
      };
      await api.createDiscount(payload);
      flashSuccess(`Discount Rule "${newDiscount.code}" created!`);
      setNewDiscount({
        name: '', code: '', rule_type: 'percentage', discount_value: '', min_purchase: '0', min_quantity: '1', usage_limit: '100'
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Scene 1: Only admin can add a new member of staff
  async function handleCreateStaff(e) {
    e.preventDefault();
    try {
      await api.register({
        ...newStaff,
        role: 'staff'
      });
      flashSuccess(`Staff account created for ${newStaff.full_name}!`);
      setNewStaff({ full_name: '', email: '', password: '', phone: '', company_name: 'Brightloop Internal Team' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-sage-light text-sage-deep px-4 py-3 rounded-2xl flex items-center gap-2 border border-sage-border shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-sage-deep shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Sub Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2E6E3] pb-3 overflow-x-auto">
        {[
          { id: 'products', label: 'Products & Variants (Scene 2)', icon: Layers },
          { id: 'plans', label: 'Subscription Plans', icon: Calendar },
          { id: 'discounts', label: 'Discount & Offer Rules (Scene 5)', icon: Percent },
          { id: 'staff', label: 'Staff Management (Scene 1)', icon: UserPlus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
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

      {/* 1. PRODUCTS & VARIANTS TAB */}
      {activeSubTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Product Form */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-sage-deep" />
              Launch New Product
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              Add products with type, sales price, cost price, and brand variants (e.g. Odoo brand adds +$560).
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-charcoal">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop CRM Suite"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-sage-mid/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1200.00"
                    value={newProduct.sales_price}
                    onChange={(e) => setNewProduct({ ...newProduct, sales_price: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="400.00"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-sage-light/50 border border-sage-border rounded-2xl">
                <p className="text-xs font-bold text-sage-deep mb-2">Variant Configuration (Scene 2)</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Variant Name"
                    value={newProduct.variant_name}
                    onChange={(e) => setNewProduct({ ...newProduct, variant_name: e.target.value })}
                    className="w-full bg-white border border-[#E2E6E3] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-muted whitespace-nowrap">Adds Price ($):</span>
                    <input
                      type="number"
                      placeholder="560"
                      value={newProduct.variant_extra}
                      onChange={(e) => setNewProduct({ ...newProduct, variant_extra: e.target.value })}
                      className="w-full bg-white border border-[#E2E6E3] rounded-lg px-2.5 py-1.5 text-xs font-bold text-charcoal focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Notes & Description</label>
                <textarea
                  rows="2"
                  placeholder="Feature highlights, SLA terms..."
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-sage-deep text-white font-semibold text-xs py-2.5 rounded-full hover:bg-sage-primary transition-all shadow-sm"
              >
                Launch Product & Variant
              </button>
            </form>
          </div>

          {/* Existing Products List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal mb-4">Catalog Products ({products.length})</h3>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] hover:bg-white transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-charcoal">{p.name}</h4>
                      <p className="text-xs text-slate-muted mt-0.5">{p.notes || 'Business service'}</p>
                    </div>
                    <span className="text-base font-extrabold text-charcoal bg-white px-3 py-1 rounded-full border border-[#E2E6E3]">
                      ${p.sales_price?.toFixed(2)}
                    </span>
                  </div>

                  {/* Variants display */}
                  {p.variants?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#EAEAE4] flex flex-wrap gap-2">
                      <span className="text-[11px] font-semibold text-slate-muted">Variants:</span>
                      {p.variants.map((v) => (
                        <span key={v.id} className="text-[11px] font-medium bg-white px-2.5 py-0.5 rounded-full border border-[#E2E6E3] text-charcoal">
                          {v.variant_name} {v.price_extra > 0 && <span className="font-bold text-sage-deep">(+${v.price_extra})</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBSCRIPTION PLANS TAB */}
      {activeSubTab === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Plan */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-sage-deep" />
              Configure Subscription Plan
            </h3>
            
            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-charcoal">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Monthly"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Billing Frequency</label>
                <select
                  value={newPlan.billing_frequency}
                  onChange={(e) => setNewPlan({ ...newPlan, billing_frequency: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs font-medium text-charcoal focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal">Recurring Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1200.00"
                    value={newPlan.cost}
                    onChange={(e) => setNewPlan({ ...newPlan, cost: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Min Quantity</label>
                  <input
                    type="number"
                    value={newPlan.min_quantity}
                    onChange={(e) => setNewPlan({ ...newPlan, min_quantity: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Lifecycle Options from Scene 2 */}
              <div className="space-y-2 pt-2 border-t border-[#ECECE6]">
                <p className="text-xs font-bold text-charcoal">Plan Lifecycle Rules</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlan.auto_close}
                    onChange={(e) => setNewPlan({ ...newPlan, auto_close: e.target.checked })}
                    className="rounded text-sage-deep focus:ring-0"
                  />
                  <span className="text-xs text-charcoal">Close automatically when plan ends</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlan.can_pause}
                    onChange={(e) => setNewPlan({ ...newPlan, can_pause: e.target.checked })}
                    className="rounded text-sage-deep focus:ring-0"
                  />
                  <span className="text-xs text-charcoal">Allow customers to pause subscription</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlan.can_renew}
                    onChange={(e) => setNewPlan({ ...newPlan, can_renew: e.target.checked })}
                    className="rounded text-sage-deep focus:ring-0"
                  />
                  <span className="text-xs text-charcoal">Allow self-renewal & extension</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-sage-deep text-white font-semibold text-xs py-2.5 rounded-full hover:bg-sage-primary transition-all shadow-sm"
              >
                Create Plan
              </button>
            </form>
          </div>

          {/* Active Plans Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal mb-4">Configured Subscription Plans ({plans.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((pl) => (
                <div key={pl.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sage-light text-sage-deep px-2.5 py-0.5 rounded-full">
                        {pl.billing_frequency}
                      </span>
                      <span className="text-lg font-extrabold text-charcoal">
                        ${pl.cost}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-charcoal mt-2">{pl.name}</h4>
                    <p className="text-xs text-slate-muted mt-1">Min Seats: {pl.min_quantity}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EAEAE4] flex items-center justify-between text-[11px] text-slate-muted">
                    <span>{pl.can_pause ? '✓ Pausable' : '✗ Fixed'}</span>
                    <span>{pl.can_renew ? '✓ Renewable' : '✗ One-off'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DISCOUNT & OFFER RULES TAB */}
      {activeSubTab === 'discounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2 mb-4">
              <Percent className="w-4 h-4 text-sage-deep" />
              Create Discount Rule (Scene 5)
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              Admin-controlled discounts apply to specific products or whole subscriptions, automatically appearing on next invoices.
            </p>

            <form onSubmit={handleCreateDiscount} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-charcoal">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Volume Discount"
                  value={newDiscount.name}
                  onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="PROMO15"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs uppercase font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal">Type</label>
                  <select
                    value={newDiscount.rule_type}
                    onChange={(e) => setNewDiscount({ ...newDiscount, rule_type: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10"
                    value={newDiscount.discount_value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, discount_value: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal">Min Purchase ($)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={newDiscount.min_purchase}
                    onChange={(e) => setNewDiscount({ ...newDiscount, min_purchase: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Usage Limit</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newDiscount.usage_limit}
                    onChange={(e) => setNewDiscount({ ...newDiscount, usage_limit: e.target.value })}
                    className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-sage-deep text-white font-semibold text-xs py-2.5 rounded-full hover:bg-sage-primary transition-all shadow-sm"
              >
                Save Discount Rule
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal mb-4">Active Discount Rules ({discounts.length})</h3>
            <div className="space-y-3">
              {discounts.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold bg-sage-light text-sage-deep px-2.5 py-0.5 rounded-md border border-sage-border">
                        {d.code}
                      </span>
                      <h4 className="font-bold text-sm text-charcoal">{d.name}</h4>
                    </div>
                    <p className="text-xs text-slate-muted mt-1">
                      Min Purchase: ${d.min_purchase} | Min Qty: {d.min_quantity} | Times Used: {d.times_used} / {d.usage_limit}
                    </p>
                  </div>

                  <span className="text-base font-extrabold text-sage-deep">
                    {d.rule_type === 'percentage' ? `${d.discount_value}% OFF` : `-$${d.discount_value}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. STAFF MANAGEMENT TAB */}
      {activeSubTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-sage-deep" />
              Add Staff Member (Scene 1)
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              "Only the admin can add a new member of staff." Password must be &gt;8 chars, uppercase, lowercase &amp; special symbol.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-charcoal">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="sarah.sales@brightloop.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Password (&gt;8 chars, upper, lower, special)</label>
                <input
                  type="password"
                  required
                  placeholder="Staff@1234"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 555-0142"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full mt-1 bg-[#FAF9F5] border border-[#E2E6E3] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sage-deep text-white font-semibold text-xs py-2.5 rounded-full hover:bg-sage-primary transition-all shadow-sm"
              >
                Authorize & Create Staff
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-soft border border-[#E2E6E3]">
            <h3 className="text-base font-bold text-charcoal mb-4">Authorized Internal Staff ({staffUsers.length})</h3>
            <div className="space-y-3">
              {staffUsers.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl border border-[#ECECE6] bg-[#FAF9F5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center font-bold text-sage-deep">
                      {s.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-charcoal">{s.full_name}</h4>
                      <p className="text-xs text-slate-muted">{s.email}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold bg-white text-charcoal px-3 py-1 rounded-full border border-[#E2E6E3]">
                    Staff Role
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
