import {
  emptyWorkspace,
  loadWorkspace,
  createWorkspaceRecord,
  updateWorkspaceRecord,
  convertWorkspaceQuote,
  runWorkspaceBilling,
} from "./liveApi";
import Analytics from "./Analytics";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  CalendarDays,
  Tags,
  Users,
  FileText,
  CreditCard,
  Settings,
  Search,
  ArrowUpRight,
  Plus,
  Download,
  ChevronRight,
  Layers,
  LogOut,
} from "lucide-react";
import gsap from "gsap";
import { useAuth } from "../../context/AuthContext";
import { money, today, seed, readData, nextDate } from "./data";
import "./workspace.css";
import "./polish.css";
const menus = {
  admin: [
    ["analytics", "Analytics & payouts", BarChart3],
    ["dashboard", "Overview", LayoutDashboard],
    ["subscriptions", "Subscriptions", CalendarDays],
    ["quotes", "Quotations", FileText],
    ["invoices", "Invoices & payments", CreditCard],
    ["products", "Products", Package],
    ["plans", "Subscription plans", Layers],
    ["discounts", "Discount rules", Tags],
    ["templates", "Quote templates", FileText],
    ["customers", "Customers", Users],
    ["staff", "Staff management", Users],
    ["taxes", "Taxes", Settings],
  ],
  staff: [
    ["dashboard", "My workspace", LayoutDashboard],
    ["quotes", "Quotations", FileText],
    ["subscriptions", "Subscriptions", CalendarDays],
    ["invoices", "Invoices & payments", CreditCard],
    ["customers", "Customers", Users],
    ["profile", "My profile", Settings],
  ],
};
const pageDescriptions = {
  quotes: "Prepare proposals, review requests and track each quotation.",
  subscriptions: "Manage contract stages, renewals and upcoming billing dates.",
  invoices: "Review invoices, record collections and follow up on balances.",
  products: "Maintain product pricing, editions and catalogue details.",
  plans: "Define billing schedules and the rules for each subscription plan.",
  discounts: "Manage eligibility, validity and usage limits for your offers.",
  templates: "Keep reusable proposals ready for the next customer.",
  customers: "Find customer contact and company information.",
  staff: "Manage the internal team and staff records.",
  taxes: "Maintain the tax rates used for new quotations.",
  profile: "Your account details and workspace access.",
};
const navGroups = {
  admin: {
    analytics: "Business",
    products: "Catalogue",
    customers: "Administration",
  },
  staff: { dashboard: "Workspace", customers: "Directory" },
};
const formSections = {
  products: {
    name: "Product details",
    sales_price: "Pricing",
    brand: "Variant",
    notes: "Additional information",
  },
  plans: {
    name: "Plan details",
    cost: "Billing",
    start: "Availability",
    auto_close: "Lifecycle permissions",
  },
  discounts: {
    name: "Offer details",
    type: "Discount value",
    min_purchase: "Eligibility",
    start: "Validity and usage",
    scope: "Applies to",
  },
  quotes: {
    template: "Customer and template",
    product: "Product and pricing",
    tax: "Tax and discount",
    valid_days: "Dates and terms",
  },
  templates: {
    name: "Template details",
    product: "Default product line",
    valid_days: "Validity and terms",
  },
  payments: { invoice: "Payment allocation", method: "Transaction details" },
  payouts: { amount: "Settlement amounts", date: "Settlement details" },
  customers: { name: "Customer details" },
  staff: { name: "Staff details" },
  taxes: { name: "Tax details" },
};
function formGroups(type) {
  const groups = [];
  for (const field of schemas[type]) {
    const title = formSections[type]?.[field[0]];
    if (title || !groups.length)
      groups.push({ title: title || "Details", fields: [] });
    groups.at(-1).fields.push(field);
  }
  return groups;
}
const numericColumns = new Set([
  "total",
  "balance",
  "sales_price",
  "cost_price",
  "extra",
  "cost",
  "amount",
  "fee",
  "quantity",
  "value",
  "rate",
  "valid_days",
]);
const columnClass = (key) =>
  numericColumns.has(key)
    ? "cell-number"
    : key === "id"
      ? "cell-reference"
      : ["customer", "name"].includes(key)
        ? "cell-name"
        : "";
const schemas = {
  products: [
    ["name", "Product name"],
    ["type", "Product type", "select", ["Software", "Service", "Add-on"]],
    ["sales_price", "Sales price", "number"],
    ["cost_price", "Cost price", "number"],
    ["brand", "Brand"],
    ["variant", "Variant name"],
    ["extra", "Variant extra price", "number"],
    ["notes", "Notes", "textarea"],
  ],
  plans: [
    ["name", "Plan name"],
    ["product", "Product", "products"],
    ["cost", "Recurring cost", "number"],
    [
      "frequency",
      "Billing frequency",
      "select",
      ["daily", "weekly", "monthly", "yearly"],
    ],
    ["quantity", "Minimum quantity", "number"],
    ["start", "Available from", "date"],
    ["end", "Available until", "date"],
    ["auto_close", "Close automatically at expiry", "checkbox"],
    ["can_close", "Allow early closure", "checkbox"],
    ["can_pause", "Allow pause", "checkbox"],
    ["can_renew", "Allow renewal", "checkbox"],
  ],
  discounts: [
    ["name", "Rule name"],
    ["code", "Discount code"],
    ["type", "Discount type", "select", ["percentage", "fixed"]],
    ["value", "Discount value", "number"],
    ["min_purchase", "Minimum purchase", "number"],
    ["min_quantity", "Minimum quantity", "number"],
    ["start", "Starts", "date"],
    ["end", "Ends", "date"],
    ["limit", "Usage limit", "number"],
    ["scope", "Applies to", "select", ["subscription", "product"]],
    ["product", "Eligible product", "products"],
  ],
  customers: [
    ["name", "Full name"],
    ["email", "Email", "email"],
    ["company", "Company"],
  ],
  staff: [
    ["name", "Full name"],
    ["email", "Work email", "email"],
  ],
  taxes: [
    ["name", "Tax name"],
    ["rate", "Rate (%)", "number"],
  ],
  templates: [
    ["name", "Template name"],
    ["plan", "Plan", "plans"],
    ["product", "Product line", "products"],
    ["quantity", "Quantity", "number"],
    ["valid_days", "Validity in days", "number"],
    [
      "terms",
      "Payment terms",
      "select",
      ["Due on receipt", "Net 15", "Net 30"],
    ],
    ["notes", "Notes", "textarea"],
  ],
  quotes: [
    ["template", "Start from template", "templates"],
    ["customer", "Customer", "customers"],
    ["plan", "Plan", "plans"],
    ["product", "Product", "products"],
    ["variant", "Edition", "select", ["Standard", "Variant"]],
    ["quantity", "Quantity", "number"],
    ["price", "Unit price", "number"],
    ["tax", "Tax rate (%)", "number"],
    ["discount", "Discount code"],
    ["valid_days", "Validity in days", "number"],
    ["start", "Subscription starts", "date"],
    ["end", "Subscription expires", "date"],
    [
      "terms",
      "Payment terms",
      "select",
      ["Due on receipt", "Net 15", "Net 30"],
    ],
    ["notes", "Notes", "textarea"],
  ],
  payments: [
    ["invoice", "Invoice", "invoices"],
    ["amount", "Amount", "number"],
    [
      "method",
      "Payment method",
      "select",
      ["Bank transfer", "Card", "UPI", "Cash"],
    ],
    ["date", "Payment date", "date"],
    ["note", "Note", "textarea"],
  ],
  payouts: [
    ["amount", "Net payout", "number"],
    ["fee", "Processing fee", "number"],
    ["date", "Settlement date", "date"],
    ["status", "Status", "select", ["Pending", "Settled", "Failed"]],
    ["method", "Destination / method"],
    ["reference", "Settlement reference"],
  ],
};
const titles = {
  products: "Product",
  plans: "Plan",
  discounts: "Discount rule",
  customers: "Customer",
  staff: "Staff member",
  taxes: "Tax rule",
  templates: "Template",
  quotes: "Quotation",
  payments: "Payment",
  payouts: "Payout",
};
const Badge = ({ value }) => (
  <span
    className={
      "badge " +
      (["Active", "Paid", "Accepted", "Settled", "Confirmed"].includes(value)
        ? "good"
        : ["Rejected", "Cancelled", "Closed", "Failed", "Overdue"].includes(
              value,
            )
          ? "bad"
          : "pending")
    }
  >
    {value}
  </span>
);
export default function Workspace({ role = "admin", preview = false }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const busyRef = useRef(false);
  const [loading, setLoading] = useState(!preview);
  const [params, setParams] = useSearchParams();
  const nav = menus[role].some((x) => x[0] === params.get("view"))
    ? params.get("view")
    : "dashboard";
  const [data, setData] = useState(() =>
      preview ? readData() : emptyWorkspace(),
    ),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All"),
    [modal, setModal] = useState(null),
    [form, setForm] = useState({}),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [range, setRange] = useState("all"),
    [page, setPage] = useState(1);
  const body = useRef();
  const dialog = useRef();
  const name =
    auth.user?.full_name ||
    (role === "admin" ? "Carlic Bolomboy" : "Sarah Jenkins");
  useEffect(() => {
    if (!preview) return;
    setData((d) => ({
      ...d,
      subscriptions: d.subscriptions.map((s) =>
        s.status === "Active" &&
        s.end < today() &&
        d.plans.find((p) => p.id === s.plan)?.auto_close
          ? { ...s, status: "Closed" }
          : s,
      ),
    }));
  }, []);
  useEffect(() => {
    if (preview)
      localStorage.setItem("brightloop_workspace_v1", JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    if (!preview) return;
    const sync = () => setData(readData());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    setSearch("");
    setFilter("All");
    setPage(1);
    const ctx = gsap.context(() => {
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
        gsap.fromTo(
          body.current,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.24, clearProps: "all" },
        );
    });
    return () => ctx.revert();
  }, [nav]);
  useEffect(() => {
    setPage(1);
  }, [search, filter]);
  useEffect(() => {
    if (modal) {
      dialog.current?.showModal();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
        gsap.fromTo(
          dialog.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.2, clearProps: "all" },
        );
    } else dialog.current?.close();
  }, [modal]);
  async function refreshLive() {
    try {
      setData(await loadWorkspace(role));
      setLoadError("");
    } catch (err) {
      setLoadError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (preview) return;
    let active = true;
    const refresh = async () => {
      if (busyRef.current) return;
      try {
        const next = await loadWorkspace(role);
        if (active) {
          setData(next);
          setLoadError("");
        }
      } catch (err) {
        if (active) setLoadError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, [preview, role]);
  async function liveAction(action, message) {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      setModal(null);
      setNotice(message);
      await refreshLive();
      return true;
    } catch (err) {
      setError(err.message);
      setNotice(`Action could not be completed or refreshed: ${err.message}`);
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function switchPortal(target) {
    if (preview) {
      navigate("/preview/" + target);
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await auth.quickSwitch(target);
      navigate("/" + target);
    } catch (err) {
      setNotice(
        `Could not sign into the ${target} demo account: ${err.message}`,
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const canCreate = (type) =>
    preview ||
    ["products", "plans", "discounts", "staff", "quotes", "payments"].includes(
      type,
    );
  const unsupportedNote =
    !preview &&
    {
      taxes:
        "Tax-rule management has no API endpoint yet. The displayed rate is a quotation default, not a live tax configuration.",
      templates:
        "These built-in templates are derived from live plans. Saving custom templates requires an API endpoint.",
      customers:
        "Customer records are shared with the customer portal. Customer editing is not available in the current API.",
    }[nav];
  function go(v) {
    setParams({ view: v });
  }
  function tell(t) {
    setNotice(t);
  }
  const customer = (id) =>
    data.customers.find((c) => c.id === id)?.name || "Unknown customer";
  const plan = (id) => data.plans.find((c) => c.id === id);
  const paid = (id) =>
    data.payments
      .filter((p) => p.invoice === id)
      .reduce((a, p) => a + Number(p.amount), 0);
  const owed = (i) => Math.max(0, i.total - paid(i.id));
  const overdue = (i) =>
    i.status !== "Cancelled" && owed(i) > 0 && i.due < today();
  const patch = (key, id, values) => {
    if (!preview)
      return liveAction(
        () =>
          updateWorkspaceRecord(
            key,
            data[key].find((r) => r.id === id),
            values,
          ),
        "Record updated on the server.",
      );
    setData((d) => ({
      ...d,
      [key]: d[key].map((x) => (x.id === id ? { ...x, ...values } : x)),
    }));
  };
  function open(type, record = null) {
    if (!preview && (record || !canCreate(type)))
      return tell(
        "This editor is available in preview only; the current API does not support this update.",
      );
    setError("");
    setForm(
      record
        ? { ...record }
        : {
            quantity: 1,
            frequency: "monthly",
            type: type === "discounts" ? "percentage" : "Software",
            scope: "subscription",
            cost: 1200,
            sales_price: 1200,
            cost_price: 0,
            extra: 0,
            price: 1200,
            tax: data.taxes[0]?.rate || 0,
            valid_days: 30,
            start: today(),
            end: "2027-12-31",
            date: today(),
            terms: "Net 15",
            limit: 100,
            min_purchase: 0,
            min_quantity: 1,
            fee: 0,
            status: "Pending",
            can_close: true,
            can_pause: true,
            can_renew: true,
            customer: data.customers[0]?.id,
            product: data.products[0]?.id,
            plan: data.plans[0]?.id,
            invoice: data.invoices.find(
              (i) => owed(i) > 0 && i.status === "Confirmed",
            )?.id,
            method: "Bank transfer",
            variant: "Standard",
          },
    );
    setModal({ type, edit: !!record });
  }
  function change(k, v) {
    setForm((f) => {
      let n = { ...f, [k]: v };
      if (k === "template") {
        const t = data.templates.find((t) => t.id === v);
        if (t)
          n = {
            ...n,
            ...t,
            id: f.id,
            template: v,
            price:
              data.products.find((p) => p.id === t.product)?.sales_price || 0,
          };
      }
      if (k === "plan") {
        const p = plan(v);
        if (p)
          n = {
            ...n,
            product: p.product,
            price: p.cost,
            quantity: Math.max(Number(f.quantity), p.quantity),
          };
      }
      if (k === "product" || k === "variant") {
        const p = data.products.find((p) => p.id === n.product);
        if (p)
          n.price =
            Number(p.sales_price) +
            (n.variant === "Variant" ? Number(p.extra) : 0);
      }
      return n;
    });
  }
  function totals(f) {
    const sub =
      Number(f.quantity) * Number(f.price) +
      (f.lines || []).reduce(
        (a, l) => a + Number(l.quantity) * Number(l.price),
        0,
      );
    const rule = data.discounts.find(
      (d) =>
        d.code === f.discount &&
        d.start <= today() &&
        d.end >= today() &&
        d.used < d.limit &&
        sub >= d.min_purchase &&
        f.quantity >= d.min_quantity &&
        (d.scope === "subscription" ||
          d.product === f.product ||
          (f.lines || []).some((l) => l.product === d.product)),
    );
    const eligible =
      rule?.scope === "product"
        ? (f.product === rule.product
            ? Number(f.quantity) * Number(f.price)
            : 0) +
          (f.lines || [])
            .filter((l) => l.product === rule.product)
            .reduce((a, l) => a + Number(l.quantity) * Number(l.price), 0)
        : sub;
    const discount = rule
      ? Math.min(
          eligible,
          rule.type === "percentage"
            ? (eligible * rule.value) / 100
            : Number(rule.value),
        )
      : 0;
    return {
      subtotal: sub,
      discountAmount: discount,
      total:
        Math.round((sub - discount) * (1 + Number(f.tax) / 100) * 100) / 100,
      rule,
    };
  }
  async function save(e) {
    e.preventDefault();
    const type = modal.type;
    let row = { ...form };
    for (const [k, , t] of schemas[type])
      if (t === "number") row[k] = Number(row[k]);
    if (row.start && row.end && row.end < row.start)
      return setError("End date must be after the start date.");
    if (
      type === "staff" &&
      !modal.edit &&
      (!row.password ||
        row.password.length <= 8 ||
        !/[A-Z]/.test(row.password) ||
        !/[a-z]/.test(row.password) ||
        !/[\W_]/.test(row.password))
    )
      return setError(
        "Use more than eight characters, including uppercase, lowercase and a special character.",
      );
    if (preview) delete row.password;
    if (type === "staff" || type === "customers") {
      if (
        data[type].some(
          (x) =>
            x.email.toLowerCase() === row.email.toLowerCase() &&
            x.id !== row.id,
        )
      )
        return setError("This email already exists.");
    }
    if (
      type === "discounts" &&
      data.discounts.some(
        (d) =>
          d.id !== row.id && d.code.toUpperCase() === row.code.toUpperCase(),
      )
    )
      return setError("Discount code already exists.");
    if (type === "discounts") row.code = row.code.toUpperCase();
    if (type === "discounts" && row.type === "percentage" && row.value > 100)
      return setError("Percentage discounts cannot exceed 100%.");
    if (type === "taxes" && row.rate > 100)
      return setError("Enter a rate between 0 and 100.");
    if (
      ["quotes", "templates", "plans"].includes(type) &&
      (!Number.isInteger(row.quantity) || row.quantity < 1)
    )
      return setError("Quantity must be a positive whole number.");
    if (
      (row.lines || []).some(
        (l) =>
          !Number.isInteger(Number(l.quantity)) ||
          Number(l.quantity) < 1 ||
          Number(l.price) < 0,
      )
    )
      return setError(
        "Line quantities must be positive whole numbers and prices cannot be negative.",
      );
    if (type === "quotes") {
      const p = plan(row.plan);
      if (row.quantity < p?.quantity)
        return setError("Quantity is below the selected plan minimum.");
      if (p && (row.start < p.start || row.start > p.end))
        return setError("The plan is unavailable on this start date.");
      const t = totals(row);
      if (row.discount && !t.rule)
        return setError(
          "Discount is expired, exhausted, or does not match this order.",
        );
      row = {
        ...row,
        ...t,
        rule: undefined,
        status: row.status === "Sent" ? "Sent" : "Draft",
      };
    }
    if (type === "payments") {
      const i = data.invoices.find((i) => i.id === row.invoice);
      if (
        !i ||
        i.status !== "Confirmed" ||
        row.amount <= 0 ||
        row.amount > owed(i)
      )
        return setError(
          "Select a confirmed invoice and enter an amount no greater than its outstanding balance.",
        );
    }
    if (!preview) {
      return liveAction(
        () => createWorkspaceRecord(type, row, data, auth.user),
        type === "quotes"
          ? "Quotation saved on the server and available in the customer portal. Email delivery is not implemented by the API."
          : `${titles[type]} saved on the server.`,
      );
    }
    row.id = row.id || `${type.slice(0, 3).toUpperCase()}-${Date.now()}`;
    if (type === "discounts") row.used = row.used || 0;
    setData((d) => {
      const next = {
        ...d,
        [type]: modal.edit
          ? d[type].map((x) => (x.id === row.id ? row : x))
          : [...d[type], row],
      };
      if (type === "payments") {
        next.invoices = d.invoices.map((i) =>
          i.id === row.invoice && owed(i) <= row.amount
            ? { ...i, status: "Paid" }
            : i,
        );
      }
      return next;
    });
    setModal(null);
    tell(
      `${titles[type]} saved locally.${type === "staff" ? " This demo record does not create a login account." : ""}`,
    );
  }
  function convert(q) {
    if (data.subscriptions.some((s) => s.quote === q.id))
      return tell("This quotation already has a subscription.");
    if (!preview)
      return liveAction(
        () => convertWorkspaceQuote(q),
        "Quotation approved and converted on the server.",
      );
    setData((d) => ({
      ...d,
      quotes: d.quotes.map((x) =>
        x.id === q.id ? { ...x, status: "Accepted" } : x,
      ),
      subscriptions: [
        ...d.subscriptions,
        {
          ...q,
          id: "SUB-" + Date.now(),
          quote: q.id,
          status: "Draft",
          next: q.start,
          paused: false,
        },
      ],
    }));
    tell(
      "Subscription created in Draft. Continue its lifecycle in Subscriptions.",
    );
  }
  function bill() {
    if (!preview) {
      const due = data.subscriptions.filter(
        (s) => s.status === "Active" && !s.paused,
      );
      if (!due.length)
        return tell("No active subscriptions are available for billing.");
      setModal({ type: "billing", due });
      return;
    }
    const due = data.subscriptions.filter(
      (s) =>
        s.status === "Active" &&
        !s.paused &&
        s.next <= today() &&
        s.next <= s.end &&
        !data.invoices.some(
          (i) => i.subscription === s.id && i.period === s.next,
        ),
    );
    if (!due.length)
      return tell("No subscriptions are due for a new billing period.");
    setModal({ type: "billing", due });
  }
  function confirmBilling() {
    if (!preview)
      return liveAction(
        runWorkspaceBilling,
        "Billing run completed on the server. Review the generated invoices.",
      );
    const due = modal.due;
    setData((d) => {
      let discounts = d.discounts.map((x) => ({ ...x }));
      const invoices = due.map((s, index) => {
        const rules = { ...data, discounts };
        const base =
          Number(s.price) * Number(s.quantity) +
          (s.lines || []).reduce(
            (a, l) => a + Number(l.quantity) * Number(l.price),
            0,
          );
        const rule = rules.discounts.find(
          (r) =>
            r.code === s.discount &&
            r.start <= s.next &&
            r.end >= s.next &&
            r.used < r.limit &&
            base >= r.min_purchase &&
            s.quantity >= r.min_quantity &&
            (r.scope === "subscription" ||
              r.product === s.product ||
              (s.lines || []).some((l) => l.product === r.product)),
        );
        const eligible =
          rule?.scope === "product"
            ? (s.product === rule.product
                ? Number(s.quantity) * Number(s.price)
                : 0) +
              (s.lines || [])
                .filter((l) => l.product === rule.product)
                .reduce((a, l) => a + Number(l.quantity) * Number(l.price), 0)
            : base;
        const off = rule
          ? Math.min(
              eligible,
              rule.type === "percentage"
                ? (eligible * rule.value) / 100
                : Number(rule.value),
            )
          : 0;
        if (rule) rule.used++;
        let dueDate = new Date(s.next + "T12:00:00");
        dueDate.setDate(
          dueDate.getDate() +
            (s.terms === "Net 30" ? 30 : s.terms === "Net 15" ? 15 : 0),
        );
        return {
          ...s,
          id: `INV-${Date.now()}-${index}`,
          subscription: s.id,
          period: s.next,
          date: s.next,
          due: dueDate.toLocaleDateString("en-CA"),
          status: "Draft",
          discountAmount: off,
          total: Math.round((base - off) * (1 + s.tax / 100) * 100) / 100,
        };
      });
      return {
        ...d,
        discounts,
        invoices: [...d.invoices, ...invoices],
        subscriptions: d.subscriptions.map((s) =>
          due.some((x) => x.id === s.id)
            ? { ...s, next: nextDate(s.next, plan(s.plan)?.frequency) }
            : s,
        ),
      };
    });
    setModal(null);
    tell(
      `${due.length} draft invoice(s) generated locally. Review before confirming.`,
    );
  }
  function exportRows(rows, label) {
    const keys = [...new Set(rows.flatMap(Object.keys))].filter(
      (k) => typeof rows[0]?.[k] !== "object",
    );
    const cell = (v) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@-]/, "'")
        .replaceAll('"', '""') +
      '"';
    const csv = [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => cell(r[k])).join(",")),
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = label + ".csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const active = data.subscriptions.filter(
    (s) => s.status === "Active" && !s.paused,
  ).length;
  const collected = data.payments.reduce((a, p) => a + Number(p.amount), 0);
  const outstanding = data.invoices
    .filter((i) => i.status !== "Cancelled")
    .reduce((a, i) => a + owed(i), 0);
  const metrics = (items) => (
    <div className="metrics">
      {items.map(([label, value, foot]) => (
        <div className="metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{foot}</small>
        </div>
      ))}
    </div>
  );
  function table(rows, cols, actions) {
    const filtered = rows.filter(
      (r) =>
        (filter === "All" ||
          (filter === "Overdue" ? overdue(r) : r.status === filter)) &&
        Object.values(r)
          .concat(customer(r.customer))
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
    const pages = Math.max(1, Math.ceil(filtered.length / 10));
    return (
      <>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {cols.map(([key, label]) => (
                  <th scope="col" className={columnClass(key)} key={key}>
                    {label}
                  </th>
                ))}
                {actions && (
                  <th scope="col" className="cell-actions">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice(
                  (Math.min(page, pages) - 1) * 10,
                  Math.min(page, pages) * 10,
                )
                .map((r) => (
                  <tr key={r.id}>
                    {cols.map(([key, , render]) => (
                      <td className={columnClass(key)} key={key}>
                        {render ? render(r) : String(r[key] ?? "—")}
                      </td>
                    ))}
                    {actions && (
                      <td className="cell-actions">
                        <div className="row-actions">{actions(r)}</div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty">
              No records match this view. Try another filter or add a record.
            </div>
          )}
        </div>
        <div className="pagination">
          <span>
            {filtered.length} records · Page {Math.min(page, pages)} of {pages}
          </span>
          <div>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </>
    );
  }
  const toolbar = (actions, statuses = []) => (
    <div className="toolbar">
      <label className="search">
        <Search size={16} />
        <input
          aria-label="Search records"
          placeholder="Search records or customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="row-actions">
        {statuses.length > 0 && (
          <select
            aria-label="Filter status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", ...statuses].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
  const addButton = (type) =>
    !canCreate(type) ? null : (
      <button
        disabled={busy || loading || !!loadError}
        className="primary"
        onClick={() => open(type)}
      >
        <Plus size={15} />
        {type === "quotes"
          ? "Create quotation"
          : `Add ${titles[type]?.toLowerCase()}`}
      </button>
    );
  const invoiceColumns = [
    ["id", "Invoice"],
    ["customer", "Customer", (r) => customer(r.customer)],
    ["due", "Due date"],
    ["total", "Total", (r) => money(r.total)],
    ["balance", "Outstanding", (r) => money(owed(r))],
    [
      "status",
      "Status",
      (r) => <Badge value={overdue(r) ? "Overdue" : r.status} />,
    ],
  ];
  function invoiceActions(i) {
    return (
      <>
        <button
          onClick={() => {
            setForm(i);
            setModal({ type: "invoice" });
          }}
        >
          Details
        </button>
        {i.status === "Draft" && (
          <button
            onClick={() => patch("invoices", i.id, { status: "Confirmed" })}
          >
            Confirm
          </button>
        )}
        {i.status === "Confirmed" && (
          <button
            onClick={() => {
              open("payments");
              setForm((f) => ({ ...f, invoice: i.id, amount: owed(i) }));
            }}
          >
            Record payment
          </button>
        )}
        {["Draft", "Confirmed"].includes(i.status) && paid(i.id) === 0 && (
          <button
            onClick={() => {
              setForm(i);
              setModal({ type: "cancel" });
            }}
          >
            Cancel
          </button>
        )}
      </>
    );
  }
  return (
    <div className="bl-workspace" aria-busy={busy || loading}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Layers size={22} />
          </span>
          <div>
            Brightloop<small>{role} workspace</small>
          </div>
        </div>
        <nav aria-label={role + " navigation"}>
          {menus[role].map(([id, label, Icon]) => (
            <React.Fragment key={id}>
              {navGroups[role][id] && (
                <div className="nav-group-label">{navGroups[role][id]}</div>
              )}
              <button
                key={id}
                aria-current={nav === id ? "page" : undefined}
                className={nav === id ? "selected" : ""}
                onClick={() => go(id)}
              >
                <Icon size={17} />
                {label}
              </button>
            </React.Fragment>
          ))}
        </nav>
        <div className="portal-switcher">
          <span>{preview ? "Preview portal" : "Switch demo account"}</span>
          <div>
            {(preview
              ? ["admin", "staff"]
              : ["admin", "staff", "customer"]
            ).map((target) => (
              <button
                key={target}
                disabled={busy || target === role}
                aria-pressed={target === role}
                onClick={() => switchPortal(target)}
              >
                {target}
              </button>
            ))}
          </div>
          {!preview && (
            <small>Signs in using the existing seeded demo accounts.</small>
          )}
        </div>
        <div className="account">
          <span className="avatar">{name.charAt(0)}</span>
          <div>
            <b>{name}</b>
            <small>
              {role === "admin" ? "Administrator" : "Sales operations"}
            </small>
          </div>
          {!preview && (
            <button
              aria-label="Sign out"
              onClick={() => {
                auth.logout();
                location.href = "/login";
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
      <main>
        <header className="workspace-header">
          <div>
            <span className="eyebrow">BRIGHTLOOP / {role.toUpperCase()}</span>
            <h1>{menus[role].find((x) => x[0] === nav)?.[1]}</h1>
          </div>
          <div className="header-right">
            <span className="demo-dot" />
            {preview ? "Local demo" : "Connected to API"}{" "}
            {!preview && (
              <button
                disabled={busy || loading}
                onClick={() => refreshLive().catch(() => {})}
              >
                Refresh
              </button>
            )}
            <span className="date">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </header>
        <div className="demo-banner">
          {preview
            ? "Frontend preview · Sample records and changes are saved in this browser. No money moves and no email is sent."
            : "Connected workspace · Records are shared with the customer portal through the existing API."}
          {preview && (
            <Link to={"/preview/" + (role === "admin" ? "staff" : "admin")}>
              View {role === "admin" ? "staff" : "admin"} portal{" "}
              <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
        <div className="workspace-body" ref={body}>
          {loading && (
            <div role="status" className="notice">
              Loading server records...
            </div>
          )}
          {loadError && (
            <div role="alert" className="form-error">
              Could not load server records: {loadError}.{" "}
              <button onClick={() => refreshLive().catch(() => {})}>
                Retry
              </button>
            </div>
          )}
          {unsupportedNote && <div className="notice">{unsupportedNote}</div>}
          {busy && (
            <div role="status" className="notice">
              Saving to the server...
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}
          {pageDescriptions[nav] && (
            <div className="page-intro">
              <div>
                <p>{pageDescriptions[nav]}</p>
                {data[nav] && (
                  <span className="page-record-count">
                    {data[nav].length} records in this workspace
                  </span>
                )}
              </div>
              <div className="page-primary-action">
                {nav === "invoices" ? (
                  <button className="primary" onClick={bill}>
                    Review billing run <ArrowUpRight size={16} />
                  </button>
                ) : nav === "subscriptions" ? (
                  <button className="primary" onClick={() => go("quotes")}>
                    Create from quotation <ArrowUpRight size={16} />
                  </button>
                ) : schemas[nav] && (role === "admin" || nav === "quotes") ? (
                  addButton(nav)
                ) : null}
              </div>
            </div>
          )}
          {nav === "dashboard" && (
            <>
              <div className="section-intro">
                <div>
                  <h2>
                    {role === "admin"
                      ? "A clear view of your business."
                      : "Your day, in focus."}
                  </h2>
                  <p>
                    {role === "admin"
                      ? "Subscriptions, collections and the work that needs attention."
                      : "Review proposals, manage subscriptions and keep billing on track."}
                  </p>
                </div>
                <button
                  className="primary"
                  onClick={() =>
                    role === "admin" ? go("analytics") : open("quotes")
                  }
                >
                  {role === "admin" ? "View analytics" : "Create quotation"}
                  <ArrowUpRight size={16} />
                </button>
              </div>
              {metrics(
                role === "admin"
                  ? [
                      [
                        "Collected revenue",
                        money(collected),
                        "Recorded payments",
                      ],
                      [
                        "Active subscriptions",
                        active,
                        "Excludes paused contracts",
                      ],
                      [
                        "Outstanding",
                        money(outstanding),
                        "Unpaid invoice balance",
                      ],
                      [
                        "Overdue invoices",
                        data.invoices.filter(overdue).length,
                        "Requires follow-up",
                      ],
                    ]
                  : [
                      [
                        "Pending quotations",
                        data.quotes.filter((q) =>
                          ["Draft", "Sent"].includes(q.status),
                        ).length,
                        "Ready for review",
                      ],
                      ["Active subscriptions", active, "Currently running"],
                      [
                        "Invoices to confirm",
                        data.invoices.filter((i) => i.status === "Draft")
                          .length,
                        "Review billing details",
                      ],
                      [
                        "Overdue invoices",
                        data.invoices.filter(overdue).length,
                        "Follow up with customers",
                      ],
                    ],
              )}
              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Quotation review queue</h2>
                      <p>Move the next conversation forward.</p>
                    </div>
                    <button onClick={() => go("quotes")}>
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  {table(
                    data.quotes.filter((q) =>
                      ["Draft", "Sent"].includes(q.status),
                    ),
                    [
                      ["id", "Quotation"],
                      ["customer", "Customer", (r) => customer(r.customer)],
                      ["total", "Value", (r) => money(r.total)],
                      ["status", "Status", (r) => <Badge value={r.status} />],
                    ],
                    (q) => (
                      <button
                        onClick={() => {
                          setForm(q);
                          setModal({ type: "review" });
                        }}
                      >
                        Review <ArrowUpRight size={13} />
                      </button>
                    ),
                  )}
                </section>
                <section className="panel attention">
                  <span className="eyebrow">NEEDS ATTENTION</span>
                  <h2>Keep things moving</h2>
                  {[
                    [
                      "Overdue invoices",
                      data.invoices.filter(overdue).length,
                      "invoices",
                    ],
                    [
                      "Expiring in 30 days",
                      data.subscriptions.filter(
                        (s) =>
                          s.end >= today() &&
                          new Date(s.end) - new Date(today()) <=
                            30 * 86400000 &&
                          s.status !== "Closed",
                      ).length,
                      "subscriptions",
                    ],
                    [
                      "Draft quotations",
                      data.quotes.filter((q) => q.status === "Draft").length,
                      "quotes",
                    ],
                  ].map(([l, n, v]) => (
                    <button key={l} onClick={() => go(v)}>
                      <span>{l}</span>
                      <b>{n}</b>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                  <p>
                    Review outstanding balances before the next billing cycle.
                  </p>
                </section>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <h2>Recent invoices</h2>
                  <button onClick={() => go("invoices")}>
                    All invoices <ArrowUpRight size={14} />
                  </button>
                </div>
                {table(data.invoices.slice(-5).reverse(), invoiceColumns)}
              </section>
            </>
          )}
          {nav === "analytics" && (
            <Analytics
              data={data}
              live={!preview}
              open={open}
              go={go}
              exportRows={exportRows}
            />
          )}
          {nav === "quotes" && (
            <section className="panel">
              {toolbar(addButton("quotes"), [
                "Draft",
                "Sent",
                "Accepted",
                "Rejected",
              ])}
              {table(
                data.quotes,
                [
                  ["id", "Quotation"],
                  ["customer", "Customer", (r) => customer(r.customer)],
                  ["total", "Total", (r) => money(r.total)],
                  ["valid_days", "Valid days"],
                  ["status", "Status", (r) => <Badge value={r.status} />],
                ],
                (q) => (
                  <>
                    <button
                      onClick={() => {
                        setForm(q);
                        setModal({ type: "review" });
                      }}
                    >
                      Review
                    </button>
                    {preview && ["Draft", "Sent"].includes(q.status) && (
                      <button onClick={() => open("quotes", q)}>Edit</button>
                    )}
                    {q.status === "Draft" && (
                      <button
                        onClick={() => {
                          patch("quotes", q.id, { status: "Sent" });
                          if (preview)
                            tell(
                              "Marked sent locally. Email delivery requires backend integration.",
                            );
                        }}
                      >
                        Mark sent
                      </button>
                    )}
                    {q.status === "Accepted" &&
                      !data.subscriptions.some((s) => s.quote === q.id) && (
                        <button onClick={() => convert(q)}>
                          Create subscription
                        </button>
                      )}
                  </>
                ),
              )}
            </section>
          )}
          {nav === "subscriptions" && (
            <section className="panel">
              {toolbar(
                <button onClick={() => go("quotes")}>
                  Create from quotation <ArrowUpRight size={14} />
                </button>,
                ["Draft", "Quotation", "Confirmed", "Active", "Closed"],
              )}
              {table(
                data.subscriptions,
                [
                  ["id", "Subscription"],
                  ["customer", "Customer", (r) => customer(r.customer)],
                  ["plan", "Plan", (r) => plan(r.plan)?.name],
                  ["start", "Start"],
                  ["end", "Expiry"],
                  ["next", "Next billing"],
                  [
                    "status",
                    "Status",
                    (r) => <Badge value={r.paused ? "Paused" : r.status} />,
                  ],
                ],
                (s) => {
                  const p = plan(s.plan);
                  const stages = [
                    "Draft",
                    "Quotation",
                    "Confirmed",
                    "Active",
                    "Closed",
                  ];
                  return (
                    <>
                      <button
                        onClick={() => {
                          setForm(s);
                          setModal({ type: "subscription" });
                        }}
                      >
                        Details
                      </button>
                      {stages.indexOf(s.status) < 3 && (
                        <button
                          onClick={() =>
                            patch("subscriptions", s.id, {
                              status: stages[stages.indexOf(s.status) + 1],
                            })
                          }
                        >
                          Move to {stages[stages.indexOf(s.status) + 1]}
                        </button>
                      )}
                      {s.status === "Active" && p?.can_pause && (
                        <button
                          onClick={() =>
                            patch("subscriptions", s.id, { paused: !s.paused })
                          }
                        >
                          {s.paused ? "Resume" : "Pause"}
                        </button>
                      )}
                      {s.status !== "Closed" && p?.can_close && (
                        <button
                          onClick={() => {
                            setForm(s);
                            setModal({ type: "close" });
                          }}
                        >
                          Close
                        </button>
                      )}
                      {p?.can_renew && (
                        <button
                          onClick={() => {
                            patch("subscriptions", s.id, {
                              end: nextDate(s.end, p.frequency),
                              status:
                                s.status === "Closed" ? "Confirmed" : s.status,
                            });
                            if (preview)
                              tell("Expiry extended by one billing period.");
                          }}
                        >
                          Renew
                        </button>
                      )}
                    </>
                  );
                },
              )}
            </section>
          )}
          {nav === "invoices" && (
            <>
              <section className="panel">
                {toolbar(
                  <button className="primary" onClick={bill}>
                    Review billing run <ArrowUpRight size={14} />
                  </button>,
                  ["Draft", "Confirmed", "Paid", "Cancelled", "Overdue"],
                )}
                {table(data.invoices, invoiceColumns, invoiceActions)}
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <h2>Payment ledger</h2>
                  <button onClick={() => exportRows(data.payments, "payments")}>
                    <Download size={14} />
                    Export
                  </button>
                </div>
                {table(data.payments, [
                  ["id", "Reference"],
                  ["invoice", "Invoice"],
                  ["date", "Date"],
                  ["method", "Method"],
                  ["amount", "Amount", (r) => money(r.amount)],
                  ["note", "Note"],
                ])}
              </section>
            </>
          )}
          {schemas[nav] && !["quotes"].includes(nav) && (
            <section className="panel">
              {toolbar(role === "admin" ? addButton(nav) : null)}
              {table(
                data[nav],
                nav === "products"
                  ? [
                      ["name", "Product"],
                      ["type", "Type"],
                      ["brand", "Brand"],
                      ["variant", "Variant"],
                      [
                        "sales_price",
                        "Base price",
                        (r) => money(r.sales_price),
                      ],
                      ["extra", "Variant extra", (r) => money(r.extra)],
                    ]
                  : nav === "plans"
                    ? [
                        ["name", "Plan"],
                        ["frequency", "Frequency"],
                        ["cost", "Cost", (r) => money(r.cost)],
                        ["quantity", "Min. qty"],
                        ["start", "Available from"],
                        ["end", "Available until"],
                      ]
                    : nav === "discounts"
                      ? [
                          ["code", "Code"],
                          ["name", "Rule"],
                          [
                            "value",
                            "Discount",
                            (r) =>
                              r.type === "percentage"
                                ? r.value + "%"
                                : money(r.value),
                          ],
                          ["scope", "Scope"],
                          ["end", "Expires"],
                          [
                            "used",
                            "Usage",
                            (r) => `${r.used || 0} / ${r.limit}`,
                          ],
                        ]
                      : nav === "templates"
                        ? [
                            ["name", "Template"],
                            ["plan", "Plan", (r) => plan(r.plan)?.name],
                            ["quantity", "Quantity"],
                            ["valid_days", "Valid days"],
                            ["terms", "Payment terms"],
                          ]
                        : nav === "taxes"
                          ? [
                              ["name", "Tax"],
                              ["rate", "Rate", (r) => r.rate + "%"],
                            ]
                          : [
                              ["name", "Name"],
                              ["email", "Email"],
                              [
                                nav === "staff" ? "role" : "company",
                                nav === "staff" ? "Role" : "Company",
                                (r) => (nav === "staff" ? "Staff" : r.company),
                              ],
                            ],
                role === "admin" && preview
                  ? (r) => <button onClick={() => open(nav, r)}>Edit</button>
                  : null,
              )}
            </section>
          )}
          {nav === "profile" && (
            <section className="panel profile">
              <span className="avatar large">{name.charAt(0)}</span>
              <h2>{name}</h2>
              <p>{auth.user?.email || "sarah@example.com"}</p>
              <Badge value="Sales operations" />
              <p>
                Access to customer records, quotations, subscription operations
                and invoice processing.
              </p>
            </section>
          )}
        </div>
        <footer>
          Brightloop Software <span>Subscription operations · INR</span>
        </footer>
      </main>
      <dialog
        ref={dialog}
        className={`workspace-dialog ${busy ? "is-saving" : ""}`}
        onCancel={() => setModal(null)}
        onClose={() => {
          if (modal) setModal(null);
        }}
      >
        {modal && (
          <>
            <div className="dialog-heading">
              <div>
                <span className="eyebrow">{role.toUpperCase()} WORKSPACE</span>
                <h2>
                  {schemas[modal.type]
                    ? `${modal.edit ? "Edit" : "Add"} ${titles[modal.type]}`
                    : modal.type === "billing"
                      ? "Review billing run"
                      : modal.type === "review"
                        ? "Review quotation"
                        : modal.type === "invoice"
                          ? "Invoice details"
                          : modal.type === "subscription"
                            ? "Subscription details"
                            : "Confirm action"}
                </h2>
              </div>
              <button aria-label="Close dialog" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            {schemas[modal.type] ? (
              <form onSubmit={save}>
                {!preview && (
                  <p className="muted">
                    {modal.type === "quotes"
                      ? "The server determines subscription dates and payment terms on conversion. Totals below are estimates; saved totals come from the API."
                      : modal.type === "payments"
                        ? "The current API records payments using today’s server date."
                        : "Changes are saved to the shared server."}
                  </p>
                )}
                {formGroups(modal.type).map((group) => (
                  <fieldset className="form-section" key={group.title}>
                    <legend>{group.title}</legend>
                    <div className="form-grid">
                      {group.fields
                        .filter(
                          ([k]) =>
                            preview ||
                            (!(
                              modal.type === "quotes" &&
                              ["start", "end", "terms"].includes(k)
                            ) &&
                              !(modal.type === "plans" && k === "can_close")),
                        )
                        .map(([k, label, type, options]) => (
                          <label
                            key={k}
                            className={type === "textarea" ? "full" : ""}
                          >
                            {type === "checkbox" ? (
                              <span className="check">
                                <input
                                  type="checkbox"
                                  checked={!!form[k]}
                                  onChange={(e) => change(k, e.target.checked)}
                                />
                                {label}
                              </span>
                            ) : (
                              <>
                                {label}
                                {type === "textarea" ? (
                                  <textarea
                                    value={form[k] || ""}
                                    onChange={(e) => change(k, e.target.value)}
                                  />
                                ) : type === "select" || data[type] ? (
                                  <select
                                    required={!["template"].includes(k)}
                                    value={form[k] ?? ""}
                                    onChange={(e) => change(k, e.target.value)}
                                  >
                                    <option value="">Select…</option>
                                    {(
                                      options ||
                                      data[type]?.filter(
                                        (r) =>
                                          type !== "invoices" ||
                                          (r.status === "Confirmed" &&
                                            owed(r) > 0),
                                      ) ||
                                      []
                                    ).map((o) => (
                                      <option key={o.id || o} value={o.id || o}>
                                        {o.name || o.id || o}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    required={
                                      ![
                                        "notes",
                                        "discount",
                                        "brand",
                                        "variant",
                                        "company",
                                        "note",
                                        "reference",
                                      ].includes(k)
                                    }
                                    disabled={
                                      !preview &&
                                      modal.type === "payments" &&
                                      k === "date"
                                    }
                                    type={type || "text"}
                                    min={
                                      [
                                        "quantity",
                                        "valid_days",
                                        "limit",
                                        "min_quantity",
                                      ].includes(k)
                                        ? 1
                                        : 0
                                    }
                                    step={type === "number" ? "any" : undefined}
                                    value={form[k] ?? ""}
                                    onChange={(e) => change(k, e.target.value)}
                                  />
                                )}
                              </>
                            )}
                          </label>
                        ))}
                    </div>
                  </fieldset>
                ))}
                {["quotes", "templates"].includes(modal.type) && (
                  <div className="extra-lines">
                    <h3>Additional product lines</h3>
                    {(form.lines || []).map((line, index) => (
                      <div className="line-editor" key={index}>
                        <select
                          aria-label={"Line " + (index + 2) + " product"}
                          value={line.product}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              lines: f.lines.map((l, i) =>
                                i === index
                                  ? {
                                      ...l,
                                      product: e.target.value,
                                      price:
                                        data.products.find(
                                          (p) => p.id === e.target.value,
                                        )?.sales_price || 0,
                                    }
                                  : l,
                              ),
                            }))
                          }
                        >
                          {data.products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label={"Line " + (index + 2) + " quantity"}
                          type="number"
                          min="1"
                          step="1"
                          value={line.quantity}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              lines: f.lines.map((l, i) =>
                                i === index
                                  ? { ...l, quantity: e.target.value }
                                  : l,
                              ),
                            }))
                          }
                        />
                        <input
                          aria-label={"Line " + (index + 2) + " price"}
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.price}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              lines: f.lines.map((l, i) =>
                                i === index
                                  ? { ...l, price: e.target.value }
                                  : l,
                              ),
                            }))
                          }
                        />
                        <button
                          type="button"
                          aria-label={"Remove line " + (index + 2)}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              lines: f.lines.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          lines: [
                            ...(f.lines || []),
                            {
                              product: data.products[0]?.id,
                              quantity: 1,
                              price: data.products[0]?.sales_price || 0,
                            },
                          ],
                        }))
                      }
                    >
                      Add product line
                    </button>
                  </div>
                )}
                {modal.type === "quotes" && (
                  <div className="quote-total">
                    Subtotal {money(totals(form).subtotal)} · Discount{" "}
                    {money(totals(form).discountAmount)}
                    <strong>Total {money(totals(form).total)}</strong>
                  </div>
                )}
                {modal.type === "staff" && !modal.edit && (
                  <label style={{ marginTop: 16 }}>
                    Initial password
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={form.password || ""}
                      onChange={(e) => change("password", e.target.value)}
                    />
                    <small>
                      More than 8 characters, uppercase, lowercase and a special
                      character.{" "}
                      {preview
                        ? "Not saved in this demo."
                        : "Submitted to the server to create the staff account."}
                    </small>
                  </label>
                )}
                {modal.type === "staff" && (
                  <p className="muted">
                    {preview
                      ? "Creates a local staff record, not a login account."
                      : "Creates a staff login through the current registration API. Your admin session is preserved."}
                  </p>
                )}
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
                <div className="dialog-actions">
                  <button type="button" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                  <button disabled={busy} className="primary">
                    {busy ? "Saving..." : "Save"}{" "}
                    {titles[modal.type]?.toLowerCase()}
                  </button>
                </div>
              </form>
            ) : modal.type === "billing" ? (
              <>
                <p>
                  {preview
                    ? `${modal.due.length} active subscription(s) are due. Existing billing periods are excluded.`
                    : `The current API bills all ${modal.due.length} active, unpaused subscriptions and skips invoices already issued today. Review this batch before proceeding.`}
                </p>
                <ul>
                  {modal.due.map((s) => (
                    <li key={s.id}>
                      {s.id} · {customer(s.customer)} · {s.next}
                    </li>
                  ))}
                </ul>
                <div className="dialog-actions">
                  <button onClick={() => setModal(null)}>Cancel</button>
                  <button className="primary" onClick={confirmBilling}>
                    Generate draft invoices
                  </button>
                </div>
              </>
            ) : ["close", "cancel"].includes(modal.type) ? (
              <>
                <p>
                  {modal.type === "close"
                    ? "Close this subscription and stop future billing?"
                    : "Cancel this unpaid invoice? Its billing period remains reserved to prevent duplicate billing."}
                </p>
                <div className="dialog-actions">
                  <button onClick={() => setModal(null)}>Keep record</button>
                  <button
                    className="primary"
                    onClick={() => {
                      patch(
                        modal.type === "close" ? "subscriptions" : "invoices",
                        form.id,
                        {
                          status:
                            modal.type === "close" ? "Closed" : "Cancelled",
                        },
                      );
                      setModal(null);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="record-summary">
                  <span>{form.id}</span>
                  <Badge value={form.status} />
                  <h3>{customer(form.customer)}</h3>
                  <p>
                    {data.customers.find((c) => c.id === form.customer)?.email}
                  </p>
                  <p>
                    {data.products.find((p) => p.id === form.product)?.name} ·{" "}
                    {form.quantity} × {money(form.price)}
                  </p>
                  {(form.lines || []).map((l, i) => (
                    <p key={i}>
                      {data.products.find((p) => p.id === l.product)?.name} ·{" "}
                      {l.quantity} × {money(l.price)}
                    </p>
                  ))}
                  <p>
                    Tax: {form.tax}% · Discount: {money(form.discountAmount)}
                  </p>
                  <p>
                    Terms: {form.terms || "Net 15"}{" "}
                    {form.start && `· ${form.start} to ${form.end}`}
                  </p>
                  <strong>{money(form.total)}</strong>
                  <p>{form.notes}</p>
                  {form.reason && <p>Rejection reason: {form.reason}</p>}
                </div>
                {modal.type === "review" &&
                  ["Draft", "Sent"].includes(form.status) && (
                    <>
                      <label>
                        {preview
                          ? "Rejection reason"
                          : "Rejection reason (not stored by current API)"}
                        <textarea
                          value={form.reason || ""}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, reason: e.target.value }))
                          }
                        />
                      </label>
                      {error && <p className="form-error">{error}</p>}
                      <div className="dialog-actions">
                        <button
                          onClick={() => {
                            if (preview && !form.reason?.trim())
                              return setError(
                                "Enter a reason before rejecting.",
                              );
                            patch("quotes", form.id, {
                              status: "Rejected",
                              reason: form.reason,
                            });
                            setModal(null);
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className="primary"
                          onClick={() => {
                            convert(form);
                            setModal(null);
                          }}
                        >
                          Approve & create subscription
                        </button>
                      </div>
                    </>
                  )}
                {modal.type === "invoice" && (
                  <div className="dialog-actions">
                    <button onClick={() => window.print()}>
                      Print invoice
                    </button>
                    <button
                      onClick={() => {
                        patch("invoices", form.id, { sent: true });
                        tell("Marked sent locally. No email was sent.");
                        setModal(null);
                      }}
                      disabled={
                        !preview ||
                        form.status === "Draft" ||
                        form.status === "Cancelled"
                      }
                    >
                      Mark sent
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
