import React, { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  ChevronRight,
  CreditCard,
  Wallet,
  Users,
  CircleDollarSign,
  SlidersHorizontal,
} from "lucide-react";
import { money, today } from "./data";
import "./analytics.css";
const colors = ["#345f51", "#8cafa0", "#ddb363", "#a7b9ca", "#bdc9bd"];
const compact = (n) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
const monthLabel = (s) =>
  new Date(s + "-01T12:00:00").toLocaleDateString("en", { month: "short" });
const monthKeys = (count) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - count + 1 + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
function illustration() {
  const months = monthKeys(6),
    plans = [
      { id: "basic", name: "Business Starter", frequency: "monthly" },
      { id: "team", name: "Team Workspace", frequency: "monthly" },
      { id: "enterprise", name: "Enterprise", frequency: "yearly" },
    ];
  const invoices = [],
    payments = [],
    payouts = [];
  months.forEach((m, i) => {
    [7200, 15600, 23800, 10400, 18500, 8200].forEach((base, j) => {
      const total = Math.round(base * (1 + i * 0.14)),
        id = `EX-${i}-${j}`;
      invoices.push({
        id,
        total,
        date: m + "-03",
        due: m + "-18",
        status: i === 5 && j > 3 ? "Confirmed" : "Paid",
        plan: plans[j % 3].id,
      });
      if (i < 5 || j < 4)
        payments.push({
          id: `PAY-${i}-${j}`,
          invoice: id,
          amount: total,
          method: ["Bank transfer", "Card", "UPI"][j % 3],
          date: m + "-12",
        });
    });
    const collected = payments
      .filter((p) => p.date.startsWith(m))
      .reduce((s, p) => s + p.amount, 0);
    payouts.push({
      id: "STL-" + (1042 + i),
      reference: "STL-" + (1042 + i),
      amount: Math.round(collected * 0.98),
      fee: Math.round(collected * 0.02),
      date: m + "-16",
      status: i === 5 ? "Pending" : "Settled",
      method: "Business bank account",
    });
  });
  const subscriptions = Array.from({ length: 48 }, (_, i) => ({
    id: "S-" + i,
    plan: plans[i % 3].id,
    status: i < 40 ? "Active" : i < 45 ? "Closed" : "Draft",
    paused: i === 6,
    quantity: 1,
    price: [1200, 2400, 28800][i % 3],
    end: months[5] + "-28",
  }));
  return { plans, invoices, payments, payouts, subscriptions };
}
function Trend({ series }) {
  const [hover, setHover] = useState(null);
  const width = 690,
    height = 220,
    pad = 36,
    max = Math.max(1, ...series.flatMap((s) => [s.billed, s.collected]));
  const x = (i) =>
      pad + (i * (width - pad * 2)) / Math.max(1, series.length - 1),
    y = (n) => height - pad - (n / max) * (height - pad * 2);
  const path = (key) =>
    series.map((s, i) => `${i ? "L" : "M"} ${x(i)} ${y(s[key])}`).join(" ");
  return (
    <div className="a-trend">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Billed and collected revenue by month"
      >
        <defs>
          <linearGradient id="analytics-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#96b5a5" stopOpacity=".35" />
            <stop offset="100%" stopColor="#96b5a5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((n) => (
          <g key={n}>
            <line
              x1={pad}
              x2={width - pad}
              y1={y(n * max)}
              y2={y(n * max)}
              stroke="#e7ece8"
              strokeDasharray="3 5"
            />
            <text x="0" y={y(n * max) + 3} fontSize="9" fill="#7f8d85">
              {compact(n * max)}
            </text>
          </g>
        ))}
        <path
          d={`${path("collected")} L ${x(series.length - 1)} ${height - pad} L ${pad} ${height - pad} Z`}
          fill="url(#analytics-fill)"
        />
        <path
          d={path("billed")}
          fill="none"
          stroke="#d3af66"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <path
          d={path("collected")}
          fill="none"
          stroke="#345f51"
          strokeWidth="3"
        />
        {series.map((s, i) => (
          <g key={s.month}>
            <text
              textAnchor="middle"
              x={x(i)}
              y={height - 8}
              fontSize="10"
              fill="#7f8d85"
            >
              {monthLabel(s.month)}
            </text>
            <circle
              cx={x(i)}
              cy={y(s.collected)}
              r={hover === i ? 6 : 4}
              fill="#345f51"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x={x(i) - 22}
              y="0"
              width="44"
              height={height - pad}
              fill="transparent"
              tabIndex="0"
              role="button"
              aria-label={`${s.month}: billed ${money(s.billed)}, collected ${money(s.collected)}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      <div className="a-chart-readout">
        {hover !== null ? (
          <>
            <b>{series[hover].month}</b>
            <span>Billed {money(series[hover].billed)}</span>
            <span>Collected {money(series[hover].collected)}</span>
          </>
        ) : (
          <span>Hover or focus a month to inspect its values / INR</span>
        )}
      </div>
    </div>
  );
}
function Donut({ items, total, label }) {
  let offset = 0;
  return (
    <div className="a-donut">
      <svg
        viewBox="0 0 150 150"
        role="img"
        aria-label={items.map((i) => `${i.name}: ${i.value}`).join(", ")}
      >
        <circle
          cx="75"
          cy="75"
          r="57"
          fill="none"
          stroke="#edf1ed"
          strokeWidth="15"
        />
        {items.map((item, i) => {
          const part = total ? (item.value / total) * 358.14 : 0;
          const el = (
            <circle
              key={item.name}
              cx="75"
              cy="75"
              r="57"
              fill="none"
              stroke={colors[i]}
              strokeWidth="15"
              strokeDasharray={`${Math.max(0, part - 3)} ${358.14 - Math.max(0, part - 3)}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 75 75)"
            />
          );
          offset += part;
          return el;
        })}
        <text
          x="75"
          y="73"
          textAnchor="middle"
          fontSize="26"
          fontWeight="600"
          fill="#223c31"
        >
          {total}
        </text>
        <text x="75" y="91" textAnchor="middle" fontSize="10" fill="#78847c">
          {label}
        </text>
      </svg>
    </div>
  );
}
export default function Analytics({
  data,
  open,
  go,
  exportRows,
  live = false,
}) {
  const [source, setSource] = useState(live ? "workspace" : "example"),
    [period, setPeriod] = useState(6),
    [metric, setMetric] = useState("revenue");
  const example = useMemo(illustration, []),
    records = source === "example" ? example : data;
  const months = monthKeys(period),
    inPeriod = (d) => months.some((m) => d?.startsWith(m));
  const invoices = records.invoices.filter(
    (i) => inPeriod(i.date) && i.status !== "Cancelled",
  );
  const payments = records.payments.filter((p) => inPeriod(p.date));
  const payouts = records.payouts.filter((p) => inPeriod(p.date));
  const paid = (id) =>
    records.payments
      .filter((p) => p.invoice === id)
      .reduce((n, p) => n + Number(p.amount), 0);
  const balance = (i) => Math.max(0, i.total - paid(i.id));
  const revenue = payments.reduce((n, p) => n + Number(p.amount), 0),
    billed = invoices.reduce((n, i) => n + i.total, 0),
    owed = invoices.reduce((n, i) => n + balance(i), 0);
  const active = records.subscriptions.filter(
    (s) => s.status === "Active" && !s.paused,
  );
  const series = months.map((month) => ({
    month,
    billed: invoices
      .filter((i) => i.date.startsWith(month))
      .reduce((n, i) => n + i.total, 0),
    collected: payments
      .filter((p) => p.date.startsWith(month))
      .reduce((n, p) => n + p.amount, 0),
  }));
  const last = series.at(-1)?.collected || 0,
    prior = series.at(-2)?.collected || 0;
  const growth = prior ? ((last - prior) / prior) * 100 : null;
  const mix = records.plans
    .map((p) => ({
      name: p.name,
      value: active.filter((s) => s.plan === p.id).length,
    }))
    .filter((p) => p.value);
  const methods = ["Bank transfer", "Card", "UPI", "Cash"].map((name) => ({
    name,
    value: payments
      .filter((p) => p.method === name)
      .reduce((n, p) => n + p.amount, 0),
  }));
  const aging = [
    ["Not due", (i) => i.due >= today()],
    [
      "1-30 days",
      (i) =>
        i.due < today() &&
        (new Date(today()) - new Date(i.due)) / 86400000 <= 30,
    ],
    [
      "31-60 days",
      (i) =>
        (new Date(today()) - new Date(i.due)) / 86400000 > 30 &&
        (new Date(today()) - new Date(i.due)) / 86400000 <= 60,
    ],
    ["60+ days", (i) => (new Date(today()) - new Date(i.due)) / 86400000 > 60],
  ].map(([name, test]) => ({
    name,
    value: invoices.filter(test).reduce((n, i) => n + balance(i), 0),
  }));
  const settled = payouts
      .filter((p) => p.status === "Settled")
      .reduce((n, p) => n + p.amount, 0),
    pending = payouts
      .filter((p) => p.status === "Pending")
      .reduce((n, p) => n + p.amount, 0);
  const rate = billed ? (revenue / billed) * 100 : 0;
  const mrr = active.reduce(
    (n, s) =>
      n +
      (s.price * s.quantity +
        (s.lines || []).reduce((a, l) => a + l.price * l.quantity, 0)) *
        ({ daily: 365 / 12, weekly: 52 / 12, monthly: 1, yearly: 1 / 12 }[
          records.plans.find((p) => p.id === s.plan)?.frequency
        ] || 1),
    0,
  );
  return (
    <div className="analytics-v2">
      <div className="a-title">
        <div>
          <span className="eyebrow">PERFORMANCE AT A GLANCE</span>
          <h2>Your business, by the numbers.</h2>
          <p>
            A closer look at revenue, subscriptions and the money coming in.
          </p>
        </div>
        <div className="a-controls">
          <select
            disabled={live}
            aria-label="Analytics data source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            {!live && <option value="example">Illustrative sample</option>}
            <option value="workspace">
              {live ? "Server records" : "Workspace records"}
            </option>
          </select>
          <select
            aria-label="Analytics period"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={6}>Last 6 months</option>
            <option value={3}>Last 3 months</option>
          </select>
          <button onClick={() => exportRows(payments, source + "-collections")}>
            <Download size={15} />
            Export
          </button>
        </div>
      </div>
      <div className="a-source">
        <span className="a-source-dot" />
        <b>
          {source === "example"
            ? "Illustrative sample dataset"
            : live
              ? "Shared server records"
              : "Your saved workspace records"}
        </b>
        <span>
          {source === "example"
            ? "A separate six-month example to explore the dashboard. Your records are unchanged."
            : live
              ? "Charts use the same API records as the customer portal. Bank payouts are not exposed by this API."
              : "Charts are calculated from the records saved in this browser."}
        </span>
      </div>
      <div className="a-kpis">
        {[
          [
            CircleDollarSign,
            "Collected revenue",
            money(revenue),
            "Payments in selected period",
          ],
          [
            Wallet,
            "Monthly recurring revenue",
            money(mrr),
            "Current contracts / before tax & discounts",
          ],
          [
            Users,
            "Active subscriptions",
            active.length,
            "Current snapshot / paused excluded",
          ],
          [
            CreditCard,
            "Outstanding balance",
            money(owed),
            "Invoices issued in selected period",
          ],
        ].map(([Icon, label, value, note], i) => (
          <div className={"a-kpi " + (i === 0 ? "a-featured" : "")} key={label}>
            <div>
              <span>{label}</span>
              <Icon size={18} />
            </div>
            <strong>{value}</strong>
            <small>{note}</small>
            {i === 0 && (
              <svg viewBox="0 0 100 25" aria-hidden="true">
                <path
                  d={series
                    .map(
                      (s, j) =>
                        `${j ? "L" : "M"} ${(j * 100) / (series.length - 1)} ${23 - (s.collected / Math.max(1, ...series.map((v) => v.collected))) * 20}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="a-main-grid">
        <section className="a-panel a-revenue">
          <div className="a-panel-title">
            <div>
              <h3>Revenue overview</h3>
              <p>How billing translates into collections</p>
            </div>
            <div className="a-segment">
              <button
                className={metric === "revenue" ? "active" : ""}
                onClick={() => setMetric("revenue")}
              >
                Trend
              </button>
              <button
                className={metric === "compare" ? "active" : ""}
                onClick={() => setMetric("compare")}
              >
                Compare
              </button>
            </div>
          </div>
          <div className="a-revenue-summary">
            <strong>{money(revenue)}</strong>
            {growth !== null ? (
              <span className={growth >= 0 ? "a-positive" : "a-negative"}>
                {growth >= 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}{" "}
                {Math.abs(growth).toFixed(1)}%{" "}
                <small>latest month vs previous</small>
              </span>
            ) : (
              <span className="a-muted">No previous-month comparison</span>
            )}
          </div>
          <div className="a-legend">
            <span>
              <i style={{ background: "#345f51" }} />
              Collected
            </span>
            <span>
              <i style={{ background: "#d3af66" }} />
              Billed
            </span>
          </div>
          {metric === "revenue" ? (
            <Trend series={series} />
          ) : (
            <div className="a-comparison">
              {series.map((s) => (
                <div key={s.month}>
                  <div className="a-bars">
                    <span
                      title={"Billed " + money(s.billed)}
                      style={{
                        height: Math.max(
                          2,
                          (s.billed /
                            Math.max(1, ...series.map((s) => s.billed))) *
                            160,
                        ),
                      }}
                    />
                    <span
                      title={"Collected " + money(s.collected)}
                      style={{
                        height: Math.max(
                          2,
                          (s.collected /
                            Math.max(1, ...series.map((s) => s.billed))) *
                            160,
                        ),
                      }}
                    />
                  </div>
                  <b>{monthLabel(s.month)}</b>
                  <small>{money(s.collected)}</small>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="a-panel a-settlement">
          <div className="a-panel-title">
            <h3>Settlement snapshot</h3>
            <Wallet size={18} />
          </div>
          <p>Net payouts in this reporting period</p>
          <strong>{live ? "Unavailable" : money(settled)}</strong>
          <span className="a-settlement-label">Settled to your account</span>
          <div className="a-settlement-details">
            <div>
              <span>Pending settlement</span>
              <b>{live ? "Unavailable" : money(pending)}</b>
            </div>
            <div>
              <span>Processing fees</span>
              <b>
                {money(payouts.reduce((n, p) => n + Number(p.fee || 0), 0))}
              </b>
            </div>
            <div>
              <span>Settlement records</span>
              <b>{payouts.length}</b>
            </div>
          </div>
          <div className="a-note">
            Payouts are separate from customer payments. These are recorded
            settlements, not live bank balances.
          </div>
          <button
            onClick={() =>
              document.getElementById("payout-register")?.scrollIntoView({
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
              })
            }
          >
            View payout register <ArrowUpRight size={15} />
          </button>
        </section>
      </div>
      <div className="a-details-grid">
        <section className="a-panel">
          <div className="a-panel-title">
            <h3>Subscription mix</h3>
            <span className="a-small-label">ACTIVE NOW</span>
          </div>
          <div className="a-mix">
            <Donut items={mix} total={active.length} label="active plans" />
            <div className="a-mix-legend">
              {mix.map((p, i) => (
                <div key={p.name}>
                  <i style={{ background: colors[i % colors.length] }} />
                  <span>{p.name}</span>
                  <b>{p.value}</b>
                </div>
              ))}
              {!mix.length && <p>No active subscriptions.</p>}
            </div>
          </div>
          <div className="a-panel-foot">
            Share of active subscriptions by plan
          </div>
        </section>
        <section className="a-panel">
          <div className="a-panel-title">
            <h3>Collection health</h3>
            <span className="a-small-label">SELECTED PERIOD</span>
          </div>
          <div className="a-health">
            <strong>
              {rate.toFixed(1)}
              <small>%</small>
            </strong>
            <span>Collected / billed</span>
          </div>
          <div className="a-health-track">
            <span style={{ width: Math.min(100, rate) + "%" }} />
          </div>
          <div className="a-health-pair">
            <div>
              <i />
              Collected<b>{money(revenue)}</b>
            </div>
            <div>
              <i />
              Outstanding<b>{money(owed)}</b>
            </div>
          </div>
          <p className="a-footnote">
            Payments received / invoices issued in this period. Payments may
            relate to earlier invoices.
          </p>
        </section>
        <section className="a-panel">
          <div className="a-panel-title">
            <h3>Payment methods</h3>
            <CreditCard size={17} />
          </div>
          <div className="a-methods">
            {methods.map((m, i) => (
              <div key={m.name}>
                <div>
                  <span>{m.name}</span>
                  <b>{money(m.value)}</b>
                </div>
                <div className="a-track">
                  <span
                    style={{
                      width: (revenue ? (m.value / revenue) * 100 : 0) + "%",
                      background: colors[i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="a-bottom-grid">
        <section className="a-panel">
          <div className="a-panel-title">
            <div>
              <h3>Receivables aging</h3>
              <p>Outstanding balances by days past due</p>
            </div>
            <button
              onClick={() => {
                go("invoices");
              }}
            >
              Invoices <ChevronRight size={14} />
            </button>
          </div>
          <div className="a-aging">
            {aging.map((a, i) => (
              <div key={a.name}>
                <div>
                  <span>{a.name}</span>
                  <strong>{money(a.value)}</strong>
                </div>
                <div className="a-track">
                  <span
                    style={{
                      width: (owed ? (a.value / owed) * 100 : 0) + "%",
                      background: ["#8cafa0", "#c7ad72", "#c48e65", "#ab6e61"][
                        i
                      ],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="a-panel">
          <div className="a-panel-title">
            <div>
              <h3>Billing performance</h3>
              <p>Month-by-month collection details</p>
            </div>
            <SlidersHorizontal size={16} />
          </div>
          <div className="a-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Billed</th>
                  <th>Collected</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {series
                  .slice()
                  .reverse()
                  .map((s) => (
                    <tr key={s.month}>
                      <td>{s.month}</td>
                      <td>{money(s.billed)}</td>
                      <td>{money(s.collected)}</td>
                      <td>
                        <span className="a-ratio">
                          {s.billed
                            ? ((s.collected / s.billed) * 100).toFixed(0) + "%"
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="a-panel" id="payout-register">
        <div className="a-panel-title">
          <div>
            <h3>Payout register</h3>
            <p>
              {source === "example"
                ? "Illustrative settlements / switch to Workspace records to add or edit payouts"
                : live
                  ? "Payout tracking requires an API endpoint; no settlement data is available."
                  : "Manually tracked settlements"}
            </p>
          </div>
          {source === "workspace" && !live && (
            <button className="primary" onClick={() => open("payouts")}>
              Add payout
            </button>
          )}
        </div>
        <div className="a-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Settlement date</th>
                <th>Destination</th>
                <th>Fee</th>
                <th>Net payout</th>
                <th>Status</th>
                {source === "workspace" && !live && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {payouts
                .slice()
                .reverse()
                .map((p) => (
                  <tr key={p.id}>
                    <td>{p.reference || p.id}</td>
                    <td>{p.date}</td>
                    <td>{p.method}</td>
                    <td>{money(p.fee)}</td>
                    <td>{money(p.amount)}</td>
                    <td>
                      <span
                        className={
                          "badge " +
                          (p.status === "Settled"
                            ? "good"
                            : p.status === "Failed"
                              ? "bad"
                              : "pending")
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    {source === "workspace" && !live && (
                      <td>
                        <button onClick={() => open("payouts", p)}>Edit</button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
          {!payouts.length && (
            <div className="empty">No payout records in this period.</div>
          )}
        </div>
      </section>
    </div>
  );
}
