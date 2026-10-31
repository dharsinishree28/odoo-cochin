# Brightloop Software - Subscription & Quotation Management System

A subscription-based quotation and offers management web platform featuring **Admin**, **Staff**, and **Customer** portals, built for **Brightloop Software** adhering to the **Odoo Cochin Hackathon** specifications and visually styled after the reference sage green, warm grey, and white minimalist dashboard design

---

## 🎨 Visual Design System (Sage Green & Warm Grey Palette)

- **Canvas Background**: Warm Sand / Grey (`#EDECE7` / `#F3F2ED`)
- **Cards**: Pure White (`#FFFFFF`) with `rounded-3xl` (24px) border radius and soft elevation shadow (`box-shadow: 0 4px 20px -2px rgba(0,0,0,0.04)`)
- **Primary Sage Green**:
  - Deep Forest Sage: `#3D5647` (featured cards, primary pill CTAs, active indicators)
  - Mid Sage Green: `#5C7C66` (sparklines, organic wave line chart, radial gauge progress)
  - Soft Sage Tint: `#E8F0EB` (positive metric pills e.g. `+2.45%`, badge fills)
- **Secondary Accents**:
  - Soft Terracotta / Rose: `#FCEAEA` / `#B84A4A` (negative metric pills e.g. `-4.75%`, overdue indicators)
  - Soft Gold / Amber: `#F6EEDA` / `#947833` (earnings and tokens)
- **UI Components**:
  - **Left Floating Dock**: Vertical pill navigation dock with sunburst glyph, icon links, and user avatar.
  - **Header Bar**: Personalized greetings, pill-shaped search input with dark circular search button, notification badges, and portal switcher.
  - **Featured Sage Card**: Solid Deep Sage activity card with white curved line.
  - **Balance Wave Card**: Smooth organic wave SVG chart with Saves `43.50%` (`+2.45%`) and Balance `$52,422` (`-4.75%`).
  - **Radial Gauge Card**: Semi-circle progress arc (80%) for profit and win rate.
  - **Wallet Card Stack**: 3D overlapping frosted and sage cards with "Add New Card +" pill button.
  - **Transfers List**: Activity log with Anna Jones, Carlos Brown III, and Joel Cannan.
  - **Keep You Safe Card**: Fingerprint security card with sage pill CTA.

---

## 🚀 Portal Features & Challenge Scenes

### 1. Scene 1: Customer Signup & Access Control
- Email uniqueness validation.
- Password strength validation: More than 8 characters, with at least one uppercase letter, one lowercase letter, and one special character.
- Password reset simulation with secure token.
- Strict role-based isolation: Admin controls the full platform, Staff handles day-to-day operations, Customers access only their own subscriptions and invoices.
- **Admin-only Staff Creation**: Only the admin has privileges to provision new staff accounts.

### 2. Scene 2: Product & Plan Launch
- Product manager with cost price, sales price, notes, and brand variants.
- **Odoo Brand Variant Integration**: Selecting the Odoo brand variant adds **+$560.00** to the price as required.
- Subscription Plan builder supporting **daily, weekly, monthly, and yearly** frequencies.
- Plan lifecycle toggles: auto-close on end, pausable, and renewable.

### 3. Scene 3: Turning a Quote into a Subscription
- Sales reps draft offers starting from pre-built quotation templates.
- Configurable product and variant lines, quantities, unit prices, and tax rates.
- Validity periods (e.g., 15, 30, 45 days).
- One-click quote acceptance and automatic transformation into a confirmed subscription.
- Full 5-stage lifecycle state machine:
  $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longrightarrow \text{Closed}$$

### 4. Scene 4: Automated Billing Day
- One-click batch billing engine: scans all active subscriptions due for renewal and automatically compiles invoices without manual typing.
- Automatic tax calculations derived from admin-configured tax rules (e.g. 18% GST).
- Duplicate prevention ensuring no customer is billed twice or skipped.
- Invoice state lifecycle: $\text{Draft} \longrightarrow \text{Confirmed} \longrightarrow \text{Paid}$.

### 5. Scene 5: Discount Rules & Special Offers
- Admin-defined discount rules (percentage or fixed dollar amounts).
- Enforces minimum purchase amounts, minimum seat quantities, expiration dates, and usage limits.
- Automatically applied to quotations and recurring invoices.

### 6. Scene 6: Payment Recording
- Record payments against invoices with method (`Bank Transfer`, `Credit Card`, `UPI`, `Stripe`, `Cash`), date, amount, and notes.
- Automatic status update to `Paid` upon complete settlement.
- Real-time tracking of paid, pending, and overdue invoices.

### 7. Scene 7: Finance Lead Real-Time Analytics
- Instant summary view of active subscriptions, Monthly Recurring Revenue (MRR), total revenue collected, and overdue receivables.
- Optimized database indexing delivering sub-second response times.

---

## 🛠️ Project Structure

```
odoo/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application with CORS & lifecycle events
│   │   ├── database.py          # SQLite relational schema with foreign key constraints
│   │   ├── seed.py              # Brightloop software test dataset
│   │   ├── schemas.py           # Pydantic validation schemas (password regex, lines)
│   │   └── routers/
│   │       ├── auth.py          # Signup, login, password reset, user management
│   │       ├── catalog.py       # Products, variants (+560 Odoo), plans
│   │       ├── quotations.py    # Quotation templates, creation, conversion
│   │       ├── subscriptions.py # 5-stage lifecycle state machine
│   │       ├── billing.py       # Batch billing day, invoice lifecycle, payments, discounts
│   │       └── analytics.py     # Finance lead KPIs and reference dashboard metrics
│   ├── requirements.txt         # FastAPI, Uvicorn, Pydantic
│   └── brightloop.db            # Pre-seeded SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FloatingDock.jsx       # Left vertical pill dock
│   │   │   ├── HeaderBar.jsx          # Greetings, search pill, notifications, portal switcher
│   │   │   ├── MetricCard.jsx         # KPI cards & solid deep-sage activity card
│   │   │   ├── BalanceWaveCard.jsx    # Organic sage green wave chart
│   │   │   ├── RadialEarningsCard.jsx # 80% semi-circle radial gauge
│   │   │   ├── ProfileCard.jsx        # Memoji avatar & profile statistics
│   │   │   ├── WalletCardStack.jsx    # 3D layered credit cards
│   │   │   ├── TransfersListCard.jsx  # Activity list with +/- percentage badges
│   │   │   ├── KeepYouSafeCard.jsx    # Fingerprint security card
│   │   │   └── AuthModal.jsx          # Login, registration, password validation
│   │   ├── portals/
│   │   │   ├── AdminPortal.jsx        # Products, variants, plans, discounts, staff
│   │   │   ├── StaffPortal.jsx        # Quotes, subscription lifecycle, billing day
│   │   │   └── CustomerPortal.jsx     # Self-service subscriptions, offers, receipts
│   │   ├── api/
│   │   │   └── client.js              # REST API client
│   │   ├── App.jsx                    # Main application shell
│   │   ├── main.jsx
│   │   └── index.css                  # Tailwind CSS styling & custom scrollbars
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js             # Sage green and warm grey theme tokens
│   └── vite.config.js                 # Dev server proxy configuration
│
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend API Server
```powershell
# Navigate to backend and activate virtualenv
cd backend
.\.venv\Scripts\activate

# Run FastAPI server on port 8000
uvicorn app.main:app --reload
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the Frontend Application
```powershell
# In a separate terminal, navigate to frontend
cd frontend

# Start the Vite development server
npm run dev
```
Open your browser at: [http://localhost:5173](http://localhost:5173)

---


## 🔑 Demo Credentials (Pre-seeded)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `carlic@gmail.com` | `Password@123` | Full administrative control (Carlic Bolomboy) |
| **Staff** | `sarah.sales@brightloop.com` | `Staff@1234` | Sales rep (Sarah Jenkins) |
| **Customer** | `anna.jones@acmecorp.com` | `Customer@123` | Active subscriber (Anna Jones - Acme Corp) |
| **Customer** | `carlos.brown@innovate.io` | `Customer@123` | Customer (Carlos Brown III - Innovate Tech) |
| **Customer** | `joel.cannan@growth.co` | `Customer@123` | Customer (Joel Cannan - Growth Co) |
