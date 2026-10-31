export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
export const today = () => new Date().toLocaleDateString("en-CA");
export const seed = {
  products: [
    {
      id: "P-001",
      name: "Business Suite",
      type: "Software",
      sales_price: 1200,
      cost_price: 650,
      notes: "Core business applications",
      brand: "Odoo",
      variant: "Enterprise",
      extra: 560,
    },
  ],
  plans: [
    {
      id: "PL-001",
      name: "Business Monthly",
      product: "P-001",
      cost: 1200,
      frequency: "monthly",
      quantity: 1,
      start: "2026-01-01",
      end: "2027-12-31",
      auto_close: true,
      can_close: true,
      can_pause: true,
      can_renew: true,
    },
  ],
  customers: [
    {
      id: "C-001",
      name: "Anna Jones",
      email: "anna@example.com",
      company: "Acme Studio",
    },
    {
      id: "C-002",
      name: "Joel Cannon",
      email: "joel@example.com",
      company: "Cannon & Co",
    },
    {
      id: "C-003",
      name: "Carlos Brown",
      email: "carlos@example.com",
      company: "Northstar Labs",
    },
  ],
  staff: [
    {
      id: "ST-001",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      role: "Staff",
    },
  ],
  taxes: [{ id: "T-001", name: "Standard GST", rate: 18 }],
  discounts: [
    {
      id: "D-001",
      name: "Team seats",
      code: "TEAM10",
      type: "percentage",
      value: 10,
      min_purchase: 1000,
      min_quantity: 2,
      start: "2026-01-01",
      end: "2027-12-31",
      limit: 100,
      used: 0,
      scope: "subscription",
      product: "",
    },
  ],
  templates: [
    {
      id: "TP-001",
      name: "Standard business proposal",
      plan: "PL-001",
      product: "P-001",
      quantity: 1,
      valid_days: 30,
      terms: "Net 15",
      notes: "Monthly software subscription.",
    },
  ],
  quotes: [
    {
      id: "QT-001",
      customer: "C-001",
      plan: "PL-001",
      product: "P-001",
      quantity: 2,
      price: 1200,
      tax: 18,
      discount: "",
      total: 2832,
      status: "Sent",
      valid_days: 30,
      terms: "Net 15",
      start: "2026-10-01",
      end: "2027-09-30",
      notes: "Two seats for the finance team.",
    },
    {
      id: "QT-002",
      customer: "C-002",
      plan: "PL-001",
      product: "P-001",
      quantity: 1,
      price: 1200,
      tax: 18,
      total: 1416,
      status: "Draft",
      valid_days: 15,
      terms: "Net 15",
      start: "2026-10-01",
      end: "2027-09-30",
    },
  ],
  subscriptions: [
    {
      id: "SUB-001",
      customer: "C-003",
      plan: "PL-001",
      product: "P-001",
      quantity: 5,
      price: 1200,
      tax: 18,
      total: 7080,
      status: "Active",
      start: "2026-10-01",
      end: "2027-09-30",
      next: "2026-11-01",
      terms: "Net 15",
      paused: false,
    },
  ],
  invoices: [
    {
      id: "INV-001",
      customer: "C-003",
      subscription: "SUB-001",
      product: "P-001",
      quantity: 5,
      price: 1200,
      tax: 18,
      total: 7080,
      status: "Paid",
      date: "2026-10-01",
      due: "2026-10-16",
      period: "2026-10-01",
    },
    {
      id: "INV-002",
      customer: "C-001",
      product: "P-001",
      quantity: 2,
      price: 1200,
      tax: 18,
      total: 2832,
      status: "Confirmed",
      date: "2026-10-10",
      due: "2026-10-25",
    },
  ],
  payments: [
    {
      id: "PAY-001",
      invoice: "INV-001",
      amount: 7080,
      method: "Bank transfer",
      date: "2026-10-14",
      note: "October subscription",
    },
  ],
  payouts: [
    {
      id: "PO-001",
      amount: 6950,
      fee: 130,
      date: "2026-10-16",
      status: "Settled",
      reference: "DEMO-SETTLEMENT-01",
      method: "Bank transfer",
    },
  ],
};
export function readData() {
  try {
    const s = JSON.parse(localStorage.getItem("brightloop_workspace_v1"));
    return s && Object.keys(seed).every((k) => Array.isArray(s[k]))
      ? s
      : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}
export function nextDate(date, frequency) {
  const d = new Date(date + "T12:00:00");
  if (frequency === "daily") d.setDate(d.getDate() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else {
    const day = d.getDate();
    d.setDate(1);
    if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    d.setDate(
      Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()),
    );
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
