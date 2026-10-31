// Adapter for the existing backend. Preview-only records never pass through here.
const id = (value) => (value == null ? "" : String(value));
export const emptyWorkspace = () => ({
  products: [],
  plans: [],
  customers: [],
  staff: [],
  taxes: [],
  discounts: [],
  templates: [],
  quotes: [],
  subscriptions: [],
  invoices: [],
  payments: [],
  payouts: [],
});
export async function workspaceRequest(path, options = {}) {
  const token =
    localStorage.getItem("brightloop_token") ||
    sessionStorage.getItem("brightloop_token");
  const response = await fetch("/api/v1" + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(
      Array.isArray(detail)
        ? detail.map((e) => e.msg).join("; ")
        : detail || `Request failed (${response.status})`,
    );
  }
  return data;
}
const post = (path, body) =>
  workspaceRequest(path, {
    method: "POST",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const line = (l) => ({
  product: id(l.product_id),
  quantity: l.quantity,
  price: l.unit_price,
  tax: l.tax_rate,
  variant_id: l.variant_id,
  product_name: l.product_name,
});
function documentRow(row, number) {
  const lines = (row.lines || []).map(line);
  return {
    ...row,
    ...lines[0],
    apiId: row.id,
    id: row[number] || id(row.id),
    customer: id(row.customer_id),
    plan: id(row.plan_id),
    quote: row.quotation_id,
    lines: lines.slice(1),
    total: row.total_amount,
    discountAmount: row.discount_amount || 0,
    start: row.start_date,
    end: row.expiry_date,
    terms: row.payment_terms || "",
    paused: !!row.is_paused,
    next: "",
    notes: row.notes || "",
  };
}
export async function loadWorkspace(role) {
  const [
    products,
    plans,
    customers,
    staff,
    quotes,
    subscriptions,
    invoices,
    discounts,
  ] = await Promise.all([
    workspaceRequest("/catalog/products"),
    workspaceRequest("/catalog/plans"),
    workspaceRequest("/auth/users?role=customer"),
    role === "admin"
      ? workspaceRequest("/auth/users?role=staff")
      : Promise.resolve([]),
    workspaceRequest("/quotations"),
    workspaceRequest("/subscriptions"),
    workspaceRequest("/billing/invoices"),
    workspaceRequest("/billing/discounts"),
  ]);
  const q = quotes.map((r) => documentRow(r, "quote_number"));
  const inv = invoices.map((r) => ({
    ...documentRow(r, "invoice_number"),
    date: r.issue_date,
    due: r.due_date,
    subscription: subscriptions.find((s) => s.id === r.subscription_id)
      ?.subscription_number,
    paidAmount: r.paid_amount,
  }));
  return {
    ...emptyWorkspace(),
    products: products.map((p) => ({
      ...p,
      id: id(p.id),
      apiId: p.id,
      variant: p.variants?.[0]?.variant_name || "Standard",
      extra: p.variants?.[0]?.price_extra || 0,
    })),
    plans: plans.map((p) => ({
      ...p,
      id: id(p.id),
      apiId: p.id,
      product: id(p.product_id),
      frequency: p.billing_frequency,
      quantity: p.min_quantity,
      start: p.available_from || "",
      end: p.available_until || "",
      can_close: true,
      can_pause: !!p.can_pause,
      can_renew: !!p.can_renew,
      auto_close: !!p.auto_close,
    })),
    customers: customers.map((c) => ({
      ...c,
      id: id(c.id),
      name: c.full_name,
      company: c.company_name || "",
    })),
    staff: staff.map((c) => ({ ...c, id: id(c.id), name: c.full_name })),
    quotes: q,
    subscriptions: subscriptions.map((r) => ({
      ...documentRow(r, "subscription_number"),
      quote: q.find((q) => q.apiId === r.quotation_id)?.id,
    })),
    invoices: inv,
    payments: invoices.flatMap((i) =>
      (i.payments || []).map((p) => ({
        ...p,
        id: p.transaction_ref || id(p.id),
        invoice: i.invoice_number,
        amount: p.amount,
        date: p.payment_date,
        method:
          { "Bank Transfer": "Bank transfer", "Credit Card": "Card" }[
            p.method
          ] || p.method,
      })),
    ),
    discounts: discounts.map((d) => ({
      ...d,
      id: id(d.id),
      type: d.rule_type,
      value: d.discount_value,
      start: d.start_date || "0001-01-01",
      end: d.end_date || "9999-12-31",
      limit: d.usage_limit,
      used: d.times_used,
      scope:
        d.target_type === "whole_subscription" ? "subscription" : "product",
      product: id(d.target_product_id),
    })),
    templates: plans.map((p) => ({
      id: "plan-" + p.id,
      name: p.name + " proposal",
      plan: id(p.id),
      product: id(p.product_id),
      quantity: p.min_quantity,
      valid_days: 30,
    })),
    taxes: [
      {
        id: "default",
        name: "Quotation default (not a live tax-rule feed)",
        rate: 18,
      },
    ],
  };
}
export async function createWorkspaceRecord(type, row, data, user) {
  switch (type) {
    case "products":
      return post("/catalog/products", {
        name: row.name,
        type: row.type,
        sales_price: row.sales_price,
        cost_price: row.cost_price,
        notes: row.notes,
        brand: row.brand,
        variants: row.variant
          ? [{ variant_name: row.variant, price_extra: row.extra }]
          : [],
      });
    case "plans":
      return post("/catalog/plans", {
        name: row.name,
        product_id: Number(row.product),
        billing_frequency: row.frequency,
        cost: row.cost,
        min_quantity: row.quantity,
        available_from: row.start || null,
        available_until: row.end || null,
        auto_close: row.auto_close,
        can_pause: row.can_pause,
        can_renew: row.can_renew,
      });
    case "discounts":
      return post("/billing/discounts", {
        name: row.name,
        code: row.code,
        rule_type: row.type,
        discount_value: row.value,
        min_purchase: row.min_purchase,
        min_quantity: row.min_quantity,
        start_date: row.start || null,
        end_date: row.end || null,
        usage_limit: row.limit,
        target_type:
          row.scope === "subscription"
            ? "whole_subscription"
            : "specific_product",
        target_product_id: row.scope === "product" ? Number(row.product) : null,
      });
    case "staff":
      return post("/auth/register", {
        full_name: row.name,
        email: row.email,
        password: row.password,
        role: "staff",
      });
    case "quotes": {
      const product = data.products.find((p) => p.id === row.product);
      return post("/quotations", {
        customer_id: Number(row.customer),
        staff_id: user?.id,
        plan_id: Number(row.plan),
        template_name:
          data.templates.find((t) => t.id === row.template)?.name ||
          "Custom quotation",
        valid_days: row.valid_days,
        discount_code: row.discount || null,
        notes: row.notes || "",
        lines: [
          {
            product_id: Number(row.product),
            variant_id:
              row.variant === "Variant"
                ? product?.variants?.[0]?.id || null
                : null,
            quantity: row.quantity,
            unit_price: row.price,
            tax_rate: row.tax,
          },
          ...(row.lines || []).map((l) => ({
            product_id: Number(l.product),
            quantity: Number(l.quantity),
            unit_price: Number(l.price),
            tax_rate: row.tax,
          })),
        ],
      });
    }
    case "payments":
      return post("/billing/payments", {
        invoice_id: data.invoices.find((i) => i.id === row.invoice)?.apiId,
        amount: row.amount,
        method:
          { "Bank transfer": "Bank Transfer", Card: "Credit Card" }[
            row.method
          ] || row.method,
        note: row.note || "",
      });
    default:
      throw new Error("This action is not supported by the current API.");
  }
}
export async function updateWorkspaceRecord(type, row, values) {
  if (type === "quotes")
    return workspaceRequest(
      `/quotations/${row.apiId}/status?status=${encodeURIComponent(values.status)}`,
      { method: "PATCH" },
    );
  if (type === "invoices" && values.status)
    return workspaceRequest(
      `/billing/invoices/${row.apiId}/status?status=${encodeURIComponent(values.status)}`,
      { method: "PATCH" },
    );
  if (type === "subscriptions") {
    if (values.end) return post(`/subscriptions/${row.apiId}/renew`);
    if ("paused" in values) return post(`/subscriptions/${row.apiId}/pause`);
    return workspaceRequest(`/subscriptions/${row.apiId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: values.status }),
    });
  }
  throw new Error("This update is not supported by the current API.");
}
export const convertWorkspaceQuote = (q) =>
  post(`/quotations/${q.apiId}/convert-to-subscription`);
export const runWorkspaceBilling = () =>
  post("/billing/generate-batch-billing");
