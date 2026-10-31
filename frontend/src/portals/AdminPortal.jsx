import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  LayoutGrid, 
  Package, 
  Calendar, 
  Tag, 
  Users, 
  UserCheck, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Percent,
  DollarSign
} from 'lucide-react';

export default function AdminPortal({ activeNav = 'dashboard' }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Forms
  const [newProduct, setNewProduct] = useState({
    name: '',
    sales_price: '',
    cost_price: '',
    notes: '',
    brand: 'Brightloop',
    variant_name: 'Odoo Enterprise Edition',
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
    loadAllAdminData();
  }, []);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const [analyticsData, p, pl, d, staff, cust, q, inv] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getProducts(),
        api.getPlans(),
        api.getDiscounts(),
        api.getUsers('staff'),
        api.getUsers('customer'),
        api.getQuotations(),
        api.getInvoices()
      ]);
      setStats(analyticsData);
      setProducts(p);
      setPlans(pl);
      setDiscounts(d);
      setStaffUsers(staff);
      setCustomers(cust);
      setQuotations(q);
      setInvoices(inv);
    } catch (err) {
      console.warn("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  }

  // Add Product & Variant
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
      flash(`Product "${newProduct.name}" created successfully!`);
      setNewProduct({
        name: '', sales_price: '', cost_price: '', notes: '', brand: 'Brightloop',
        variant_name: 'Odoo Enterprise Edition', variant_extra: '560'
      });
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Create Plan
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
      flash(`Subscription Plan "${newPlan.name}" configured!`);
      setNewPlan({
        name: '', product_id: '', billing_frequency: 'monthly', cost: '', min_quantity: '1',
        auto_close: false, can_pause: true, can_renew: true
      });
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Create Discount
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
      flash(`Offer & Discount Rule "${newDiscount.code}" created!`);
      setNewDiscount({
        name: '', code: '', rule_type: 'percentage', discount_value: '', min_purchase: '0', min_quantity: '1', usage_limit: '100'
      });
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Add Staff Account (Admin only)
  async function handleCreateStaff(e) {
    e.preventDefault();
    try {
      await api.register({
        ...newStaff,
        role: 'staff'
      });
      flash(`Staff account authorized for ${newStaff.full_name}!`);
      setNewStaff({ full_name: '', email: '', password: '', phone: '', company_name: 'Brightloop Internal Team' });
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  const fLead = stats?.finance_lead || {};

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
          {/* Top KPI Cards in Indian Rupees ₹ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Total Customers</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">{customers.length}</h3>
              <p className="text-[11px] text-sage-dark font-medium mt-1">Verified accounts</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Active Subscriptions</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">{fLead.active_subscriptions || 1}</h3>
              <p className="text-[11px] text-sage-dark font-medium mt-1">MRR: ₹{(fLead.mrr || 1958.8).toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Total Quotations</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">{quotations.length}</h3>
              <p className="text-[11px] text-sage-dark font-medium mt-1">Win Rate: {fLead.win_rate || 33.3}%</p>
            </div>

            <div className="bg-canvas-card rounded-2xl p-5 border border-line shadow-soft">
              <p className="text-xs font-semibold text-ink-muted">Revenue Collected</p>
              <h3 className="text-2xl font-extrabold text-ink mt-1">₹{(fLead.total_revenue_collected || 1958.8).toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-ink-subtle font-medium mt-1">Total Owed: ₹{(fLead.total_owed || 14228).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Secondary Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-canvas-card rounded-2xl p-4 border border-line shadow-soft">
              <p className="text-xs text-ink-muted">Authorized Staff</p>
              <p className="text-lg font-bold text-ink mt-0.5">{staffUsers.length} members</p>
            </div>
            <div className="bg-canvas-card rounded-2xl p-4 border border-line shadow-soft">
              <p className="text-xs text-ink-muted">Catalog Products</p>
              <p className="text-lg font-bold text-ink mt-0.5">{products.length} products with variants</p>
            </div>
            <div className="bg-canvas-card rounded-2xl p-4 border border-line shadow-soft">
              <p className="text-xs text-ink-muted">Active Offers &amp; Discounts</p>
              <p className="text-lg font-bold text-ink mt-0.5">{discounts.length} promotional rules</p>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-ink">Recent System Activities</h3>
                <p className="text-xs text-ink-muted">Live audit of quotations, subscriptions, and invoices</p>
              </div>
            </div>

            <div className="divide-y divide-line text-xs">
              {invoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sage-dark mr-2">{inv.invoice_number}</span>
                    <span className="font-semibold text-ink">{inv.customer_name}</span>
                    <span className="text-ink-muted ml-2">({inv.plan_name})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink">₹{inv.total_amount?.toLocaleString('en-IN')}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      inv.status === 'Paid' ? 'bg-status-successBg text-status-successText' : 'bg-status-warningBg text-status-warningText'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS MANAGEMENT (Integrated existing product creation) */}
      {activeNav === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Integrated Product Creation Form */}
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-2">
              <Plus className="w-4 h-4 text-sage-dark" />
              Add Product &amp; Variants
            </h3>
            <p className="text-xs text-ink-muted mb-4">
              Define products, sales price, cost price, and brand variants (including Odoo brand +₹560).
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-ink">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Brightloop Business ERP"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sage-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink">Sales Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1200"
                    value={newProduct.sales_price}
                    onChange={(e) => setNewProduct({ ...newProduct, sales_price: e.target.value })}
                    className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="400"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Variant Box */}
              <div className="p-3 bg-sage-light/60 border border-line rounded-xl space-y-2">
                <p className="text-xs font-bold text-sage-dark">Product Variant</p>
                <input
                  type="text"
                  placeholder="Variant Name"
                  value={newProduct.variant_name}
                  onChange={(e) => setNewProduct({ ...newProduct, variant_name: e.target.value })}
                  className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted">Adds Price (₹):</span>
                  <input
                    type="number"
                    placeholder="560"
                    value={newProduct.variant_extra}
                    onChange={(e) => setNewProduct({ ...newProduct, variant_extra: e.target.value })}
                    className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Description &amp; Notes</label>
                <textarea
                  rows="2"
                  placeholder="Product SLA and features..."
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-2.5 rounded-full shadow-soft transition-all"
              >
                Save Product
              </button>
            </form>
          </div>

          {/* Product Catalog List */}
          <div className="lg:col-span-2 bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-4">Product Catalog ({products.length})</h3>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-line bg-canvas/30 hover:bg-white transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-ink">{p.name}</h4>
                      <p className="text-xs text-ink-muted mt-0.5">{p.notes || 'Service item'}</p>
                    </div>
                    <span className="text-base font-extrabold text-ink bg-white px-3 py-1 rounded-full border border-line">
                      ₹{p.sales_price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {p.variants?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-2">
                      <span className="text-[11px] font-bold text-ink-muted">Variants:</span>
                      {p.variants.map((v) => (
                        <span key={v.id} className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-line text-ink">
                          {v.variant_name} {v.price_extra > 0 && <span className="font-bold text-sage-dark">(+₹{v.price_extra})</span>}
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

      {/* 3. SUBSCRIPTION PLANS */}
      {activeNav === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-sage-dark" />
              Create Subscription Plan
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-ink">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="Quarterly Growth Plan"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Billing Frequency</label>
                <select
                  value={newPlan.billing_frequency}
                  onChange={(e) => setNewPlan({ ...newPlan, billing_frequency: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1200"
                    value={newPlan.cost}
                    onChange={(e) => setNewPlan({ ...newPlan, cost: e.target.value })}
                    className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink">Min Qty</label>
                  <input
                    type="number"
                    value={newPlan.min_quantity}
                    onChange={(e) => setNewPlan({ ...newPlan, min_quantity: e.target.value })}
                    className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-line text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlan.can_pause}
                    onChange={(e) => setNewPlan({ ...newPlan, can_pause: e.target.checked })}
                    className="rounded text-sage-dark"
                  />
                  <span>Allow customers to pause</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlan.can_renew}
                    onChange={(e) => setNewPlan({ ...newPlan, can_renew: e.target.checked })}
                    className="rounded text-sage-dark"
                  />
                  <span>Allow renewal</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-2.5 rounded-full shadow-soft transition-all"
              >
                Launch Plan
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-4">Subscription Packages ({plans.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((pl) => (
                <div key={pl.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sage-light text-sage-dark px-2.5 py-0.5 rounded-full border border-line">
                        {pl.billing_frequency}
                      </span>
                      <span className="text-base font-extrabold text-ink">
                        ₹{pl.cost?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-ink mt-2">{pl.name}</h4>
                    <p className="text-xs text-ink-muted mt-1">Min Seats: {pl.min_quantity}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-line flex justify-between text-[11px] text-ink-muted">
                    <span>{pl.can_pause ? '✓ Pausable' : '✗ Fixed'}</span>
                    <span>{pl.can_renew ? '✓ Renewable' : '✗ One-off'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. OFFERS & DISCOUNT RULES */}
      {activeNav === 'offers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-sage-dark" />
              Configure Offer Rule
            </h3>

            <form onSubmit={handleCreateDiscount} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-ink">Offer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Festival Special Discount"
                  value={newDiscount.name}
                  onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="FESTIVAL20"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink">Type</label>
                  <select
                    value={newDiscount.rule_type}
                    onChange={(e) => setNewDiscount({ ...newDiscount, rule_type: e.target.value })}
                    className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-ink">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="20"
                    value={newDiscount.discount_value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, discount_value: e.target.value })}
                    className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-2.5 rounded-full shadow-soft transition-all"
              >
                Save Offer Rule
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-4">Active Offer Rules ({discounts.length})</h3>
            <div className="space-y-3">
              {discounts.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-sage-light text-sage-dark px-2.5 py-0.5 rounded border border-line">
                        {d.code}
                      </span>
                      <h4 className="font-bold text-sm text-ink">{d.name}</h4>
                    </div>
                    <p className="text-xs text-ink-muted mt-1">
                      Min Purchase: ₹{d.min_purchase?.toLocaleString('en-IN')} · Times Used: {d.times_used} / {d.usage_limit}
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-sage-dark">
                    {d.rule_type === 'percentage' ? `${d.discount_value}% OFF` : `-₹${d.discount_value}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. STAFF MANAGEMENT */}
      {activeNav === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-sage-dark" />
              Provision Staff Account
            </h3>
            <p className="text-xs text-ink-muted mb-4">
              Admin-authorized internal team members with access to quotation builder and billing workflows.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-ink">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={newStaff.full_name}
                  onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Staff Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="sarah.sales@brightloop.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Password (&gt;8 chars, Upper, Lower, Symbol)</label>
                <input
                  type="password"
                  required
                  placeholder="Staff@1234"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full mt-1 bg-canvas/40 border border-line rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sage-dark hover:bg-sage-deep text-white font-bold text-xs py-2.5 rounded-full shadow-soft transition-all"
              >
                Create Staff Account
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
            <h3 className="text-base font-bold text-ink mb-4">Internal Team ({staffUsers.length})</h3>
            <div className="space-y-3">
              {staffUsers.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sage-light text-sage-dark flex items-center justify-center font-bold text-xs border border-line">
                      {s.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-ink">{s.full_name}</h4>
                      <p className="text-[11px] text-ink-muted">{s.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-full border border-line">
                    Staff Role
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. CUSTOMER MANAGEMENT */}
      {activeNav === 'customers' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
          <h3 className="text-base font-bold text-ink mb-4">Customer Directory ({customers.length})</h3>
          <div className="divide-y divide-line text-xs">
            {customers.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-ink text-sm">{c.full_name}</h4>
                  <p className="text-ink-muted mt-0.5">{c.email} · {c.phone || '+91 98765 43210'} · {c.company_name || 'Individual'}</p>
                </div>
                <span className="text-[11px] font-bold bg-sage-light text-sage-dark px-3 py-1 rounded-full border border-line">
                  Customer
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. QUOTATIONS */}
      {activeNav === 'quotations' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
          <h3 className="text-base font-bold text-ink mb-4">All Quotations &amp; Approval Status ({quotations.length})</h3>
          <div className="space-y-3">
            {quotations.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sage-dark bg-white px-2 py-0.5 rounded border border-line">
                      {q.quote_number}
                    </span>
                    <h4 className="font-bold text-sm text-ink">{q.customer_name}</h4>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{q.template_name} · Valid {q.valid_days} Days</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold text-ink">₹{q.total_amount?.toLocaleString('en-IN')}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    q.status === 'Accepted' ? 'bg-status-successBg text-status-successText' : 'bg-sage-light text-sage-dark'
                  }`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PAYMENTS & TRANSACTIONS */}
      {activeNav === 'payments' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft">
          <h3 className="text-base font-bold text-ink mb-4">Payment Transactions &amp; Receipts ({invoices.length})</h3>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-xl border border-line bg-canvas/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="font-mono font-bold text-xs text-sage-dark bg-white px-2 py-0.5 rounded border border-line mr-2">
                    {inv.invoice_number}
                  </span>
                  <span className="font-bold text-xs text-ink">{inv.customer_name}</span>
                  <p className="text-[11px] text-ink-muted mt-1">Due: {inv.due_date} · Issued: {inv.issue_date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold text-ink">₹{inv.total_amount?.toLocaleString('en-IN')}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    inv.status === 'Paid' ? 'bg-status-successBg text-status-successText' : 'bg-status-warningBg text-status-warningText'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. REPORTS */}
      {activeNav === 'reports' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft space-y-4">
          <h3 className="text-base font-bold text-ink">Financial Reports &amp; Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-canvas rounded-xl border border-line">
              <p className="text-xs text-ink-muted">Total Billed</p>
              <p className="text-xl font-extrabold text-ink mt-1">₹{(fLead.total_revenue_collected + fLead.total_owed).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-canvas rounded-xl border border-line">
              <p className="text-xs text-ink-muted">Paid Collections</p>
              <p className="text-xl font-extrabold text-status-successText mt-1">₹{(fLead.total_revenue_collected).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-canvas rounded-xl border border-line">
              <p className="text-xs text-ink-muted">Overdue Balance</p>
              <p className="text-xl font-extrabold text-status-alertText mt-1">₹{(fLead.total_owed).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. SETTINGS */}
      {activeNav === 'settings' && (
        <div className="bg-canvas-card rounded-2xl p-6 border border-line shadow-soft max-w-xl">
          <h3 className="text-base font-bold text-ink mb-4">System Configurations</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-line">
              <span className="font-semibold text-ink">Default Currency</span>
              <span className="font-bold text-sage-dark">INR (₹)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-line">
              <span className="font-semibold text-ink">GST Tax Rate</span>
              <span className="font-bold text-ink">18.0% Standard</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-line">
              <span className="font-semibold text-ink">Automatic Auto-Pay Engine</span>
              <span className="font-bold text-status-successText">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
