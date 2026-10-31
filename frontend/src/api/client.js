const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('brightloop_token') || sessionStorage.getItem('brightloop_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Request failed with status ${response.status}`;
    const err = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (creds) => request('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => ({})),
  getMe: () => request('/auth/me'),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  getUsers: (role) => request(`/auth/users${role ? `?role=${role}` : ''}`),

  // Catalog (Products, Variants, Plans)
  getProducts: () => request('/catalog/products'),
  createProduct: (data) => request('/catalog/products', { method: 'POST', body: JSON.stringify(data) }),
  addVariant: (productId, data) => request(`/catalog/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(data) }),
  getPlans: (activeOnly = false) => request(`/catalog/plans${activeOnly ? '?active_only=true' : ''}`),
  createPlan: (data) => request('/catalog/plans', { method: 'POST', body: JSON.stringify(data) }),
  togglePlan: (planId) => request(`/catalog/plans/${planId}/toggle-active`, { method: 'PATCH' }),

  // Quotations
  getQuotations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/quotations${query ? `?${query}` : ''}`);
  },
  createQuotation: (data) => request('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  updateQuoteStatus: (quoteId, status) => request(`/quotations/${quoteId}/status?status=${status}`, { method: 'PATCH' }),
  convertToSubscription: (quoteId) => request(`/quotations/${quoteId}/convert-to-subscription`, { method: 'POST' }),
  requestCustomerQuote: (data) => request('/quotations/request', { method: 'POST', body: JSON.stringify(data) }),

  // Subscriptions
  getSubscriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/subscriptions${query ? `?${query}` : ''}`);
  },
  getSubscription: (subId) => request(`/subscriptions/${subId}`),
  subscribePlan: (data) => request('/subscriptions/subscribe', { method: 'POST', body: JSON.stringify(data) }),
  updateSubStatus: (subId, status, is_paused = null) => request(`/subscriptions/${subId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, is_paused }),
  }),
  togglePauseSub: (subId) => request(`/subscriptions/${subId}/pause`, { method: 'POST' }),
  renewSub: (subId) => request(`/subscriptions/${subId}/renew`, { method: 'POST' }),

  // Billing & Invoices
  getInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/billing/invoices${query ? `?${query}` : ''}`);
  },
  runBatchBilling: () => request('/billing/generate-batch-billing', { method: 'POST' }),
  updateInvoiceStatus: (invoiceId, status) => request(`/billing/invoices/${invoiceId}/status?status=${status}`, { method: 'PATCH' }),
  recordPayment: (data) => request('/billing/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Discounts
  getDiscounts: () => request('/billing/discounts'),
  createDiscount: (data) => request('/billing/discounts', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getDashboardAnalytics: () => request('/analytics/dashboard'),
};
