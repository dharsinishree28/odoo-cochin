import hashlib
from datetime import datetime, timedelta
from app.database import get_db

SALT = "odoo_cochin_brightloop_2026_salt"

def hash_pw(pw: str, salt: str = SALT) -> str:
    return hashlib.sha256(f"{salt}:{pw}".encode("utf-8")).hexdigest()

def ensure_demo_accounts(cursor):
    """Seed the required demo testing accounts with salted passwords."""
    demo_accounts = [
        ("admin@odoocochin.com", hash_pw("Admin@123"), "Odoo Admin", "admin", "+91 98400 11001", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Odoo Cochin Ltd"),
        ("staff@odoocochin.com", hash_pw("Staff@123"), "Odoo Staff", "staff", "+91 98400 22002", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "Odoo Cochin Staff Ops"),
        ("customer@odoocochin.com", hash_pw("Customer@123"), "Odoo Customer", "customer", "+91 98400 33003", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "Cochin Enterprises")
    ]
    for email, pw_hash, name, role, phone, avatar, company in demo_accounts:
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email.lower(),))
        existing = cursor.fetchone()
        if existing:
            cursor.execute("UPDATE users SET password_hash = ?, full_name = ?, role = ?, phone = ?, avatar_url = ?, company_name = ? WHERE id = ?", (pw_hash, name, role, phone, avatar, company, existing[0]))
        else:
            cursor.execute("INSERT INTO users (email, password_hash, full_name, role, phone, avatar_url, company_name) VALUES (?, ?, ?, ?, ?, ?, ?)", (email.lower(), pw_hash, name, role, phone, avatar, company))

    # Standardize 3 tiers
    cursor.execute("UPDATE plans SET name = 'Pro Plan', cost = 1200.0, billing_frequency = 'monthly' WHERE id = 1")
    cursor.execute("UPDATE plans SET name = 'Premium Plan', cost = 12500.0, billing_frequency = 'yearly' WHERE id = 2")
    cursor.execute("UPDATE plans SET name = 'Basic Plan', cost = 350.0, billing_frequency = 'monthly' WHERE id = 3")

def seed_database():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Always verify demo accounts exist
        ensure_demo_accounts(cursor)

        # Check if users already seeded
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] > 3:
            return

        print("Seeding Brightloop Software database...")

        # 1. Seed Users (Admin, Staff, Customers)
        # Note: Anna Jones, Carlos Brown III, and Joel Cannan match the reference dashboard's "Your Transfers"
        users = [
            ("carlic@gmail.com", hash_pw("Password@123"), "Carlic Bolomboy", "admin", "+1 555-0199", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Brightloop Software HQ"),
            ("sarah.sales@brightloop.com", hash_pw("Staff@1234"), "Sarah Jenkins", "staff", "+1 555-0142", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "Brightloop Sales"),
            ("anna.jones@acmecorp.com", hash_pw("Customer@123"), "Anna Jones", "customer", "+1 555-0188", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "Acme Corp"),
            ("carlos.brown@innovate.io", hash_pw("Customer@123"), "Carlos Brown III", "customer", "+1 555-0177", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "Innovate Tech"),
            ("joel.cannan@growth.co", hash_pw("Customer@123"), "Joel Cannan", "customer", "+1 555-0166", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "Growth Co"),
            ("david.finance@brightloop.com", hash_pw("Staff@1234"), "David Sterling", "staff", "+1 555-0133", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", "Brightloop Finance")
        ]
        cursor.executemany("""
            INSERT INTO users (email, password_hash, full_name, role, phone, avatar_url, company_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, users)

        # 2. Seed Tax Rules
        cursor.execute("INSERT INTO tax_rules (name, rate, country, is_default) VALUES ('GST Standard', 18.0, 'India', 1)")
        cursor.execute("INSERT INTO tax_rules (name, rate, country, is_default) VALUES ('Reduced Tech Tax', 5.0, 'India', 0)")

        # 3. Seed Products
        products = [
            ("Brightloop Enterprise ERP", "service", 1200.0, 400.0, "Core recurring business management software suite", "Brightloop"),
            ("CRM & Lead Automation", "service", 600.0, 150.0, "Pipelines, automated follow-ups, and email tracking", "Brightloop"),
            ("Additional Team Seat", "service", 45.0, 10.0, "Per user per billing cycle seat expansion", "Brightloop"),
            ("Dedicated Cloud Infrastructure", "service", 350.0, 90.0, "High-availability dedicated cloud instance with automated backups", "Brightloop")
        ]
        for p in products:
            cursor.execute("INSERT INTO products (name, type, sales_price, cost_price, notes, brand) VALUES (?, ?, ?, ?, ?, ?)", p)

        # 4. Seed Product Variants
        cursor.execute("INSERT INTO product_variants (product_id, variant_name, price_extra) VALUES (1, 'Standard Cloud Edition', 0.0)")
        cursor.execute("INSERT INTO product_variants (product_id, variant_name, price_extra) VALUES (1, 'Odoo Brand Integrated Edition', 560.0)")
        cursor.execute("INSERT INTO product_variants (product_id, variant_name, price_extra) VALUES (1, 'Custom On-Premises Edition', 900.0)")
        cursor.execute("INSERT INTO product_variants (product_id, variant_name, price_extra) VALUES (2, 'Standard Edition', 0.0)")
        cursor.execute("INSERT INTO product_variants (product_id, variant_name, price_extra) VALUES (2, 'Odoo Sync Connector', 250.0)")

        # 5. Seed Plans
        today = datetime.now().date()
        next_year = today + timedelta(days=365)
        plans = [
            ("Monthly Business Starter", 1, "monthly", 1200.0, 1, str(today), str(next_year), 0, 1, 1),
            ("Yearly Enterprise Contract", 1, "yearly", 12500.0, 5, str(today), str(next_year), 0, 1, 1),
            ("Weekly High-Growth Trial", 1, "weekly", 350.0, 1, str(today), str(today + timedelta(days=90)), 1, 0, 1),
            ("Daily Peak Day Pass", 4, "daily", 75.0, 1, str(today), str(today + timedelta(days=60)), 1, 0, 0)
        ]
        cursor.executemany("""
            INSERT INTO plans (name, product_id, billing_frequency, cost, min_quantity, available_from, available_until, auto_close, can_pause, can_renew)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, plans)

        # 6. Seed Quotation Templates
        cursor.execute("""
            INSERT INTO quotation_templates (name, plan_id, default_valid_days, notes)
            VALUES ('Standard SaaS Subscription Offer', 1, 30, 'Standard 30-day valid template with 18% tax and payment terms Net 30')
        """)
        cursor.execute("""
            INSERT INTO quotation_templates (name, plan_id, default_valid_days, notes)
            VALUES ('Enterprise Annual Discounted Proposal', 2, 45, 'Annual package with discounted seat add-ons for enterprise clients')
        """)

        # 7. Seed Discount Rules
        cursor.execute("""
            INSERT INTO discount_rules (name, code, rule_type, discount_value, min_purchase, min_quantity, start_date, end_date, usage_limit, times_used, target_type, target_product_id)
            VALUES ('Volume Team Discount 10%', 'TEAM10', 'percentage', 10.0, 1000.0, 3, '2026-01-01', '2026-12-31', 100, 14, 'whole_subscription', NULL)
        """)
        cursor.execute("""
            INSERT INTO discount_rules (name, code, rule_type, discount_value, min_purchase, min_quantity, start_date, end_date, usage_limit, times_used, target_type, target_product_id)
            VALUES ('Early Adopter $250 Off', 'EARLY250', 'fixed', 250.0, 1200.0, 1, '2026-01-01', '2026-12-31', 50, 22, 'whole_subscription', NULL)
        """)

        # 8. Seed Subscriptions
        cursor.execute("""
            INSERT INTO subscriptions (subscription_number, quotation_id, customer_id, plan_id, status, start_date, expiry_date, payment_terms, subtotal, discount_amount, tax_amount, total_amount, billing_cycle, is_paused)
            VALUES ('SUB-2026-001', NULL, 3, 1, 'Active', '2026-10-01', '2027-10-01', 'Net 30', 1760.0, 100.0, 298.8, 1958.8, 'monthly', 0)
        """)
        sub_id = cursor.lastrowid
        cursor.execute("""
            INSERT INTO subscription_lines (subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, line_total)
            VALUES (?, 1, 2, 1, 1760.0, 18.0, 1760.0)
        """, (sub_id,))

        cursor.execute("""
            INSERT INTO subscriptions (subscription_number, quotation_id, customer_id, plan_id, status, start_date, expiry_date, payment_terms, subtotal, discount_amount, tax_amount, total_amount, billing_cycle, is_paused)
            VALUES ('SUB-2026-002', NULL, 4, 2, 'Confirmed', '2026-10-15', '2027-10-15', 'Net 15', 12500.0, 1250.0, 2025.0, 13275.0, 'yearly', 0)
        """)
        cursor.execute("""
            INSERT INTO subscription_lines (subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, line_total)
            VALUES (2, 1, 1, 1, 12500.0, 18.0, 12500.0)
        """)

        cursor.execute("""
            INSERT INTO subscriptions (subscription_number, quotation_id, customer_id, plan_id, status, start_date, expiry_date, payment_terms, subtotal, discount_amount, tax_amount, total_amount, billing_cycle, is_paused)
            VALUES ('SUB-2026-003', NULL, 5, 1, 'Quotation', '2026-11-01', '2027-11-01', 'Immediate', 1200.0, 0.0, 216.0, 1416.0, 'monthly', 0)
        """)
        cursor.execute("""
            INSERT INTO subscription_lines (subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, line_total)
            VALUES (3, 1, 1, 1, 1200.0, 18.0, 1200.0)
        """)

        cursor.execute("""
            INSERT INTO subscriptions (subscription_number, quotation_id, customer_id, plan_id, status, start_date, expiry_date, payment_terms, subtotal, discount_amount, tax_amount, total_amount, billing_cycle, is_paused)
            VALUES ('SUB-2026-004', NULL, 3, 3, 'Draft', '2026-11-05', '2026-12-05', 'Net 7', 350.0, 0.0, 63.0, 413.0, 'weekly', 0)
        """)

        cursor.execute("""
            INSERT INTO subscriptions (subscription_number, quotation_id, customer_id, plan_id, status, start_date, expiry_date, payment_terms, subtotal, discount_amount, tax_amount, total_amount, billing_cycle, is_paused)
            VALUES ('SUB-2026-005', NULL, 5, 4, 'Closed', '2026-08-01', '2026-09-01', 'Immediate', 75.0, 0.0, 13.5, 88.5, 'daily', 0)
        """)

        # 9. Seed Quotations
        cursor.execute("""
            INSERT INTO quotations (quote_number, customer_id, staff_id, plan_id, template_name, valid_days, subtotal, discount_amount, tax_amount, total_amount, notes, status)
            VALUES ('QT-2026-001', 3, 2, 1, 'Standard SaaS Subscription Offer', 30, 1760.0, 100.0, 298.8, 1958.8, 'Includes Odoo Brand variant integration and priority onboarding', 'Accepted')
        """)
        cursor.execute("""
            INSERT INTO quotations (quote_number, customer_id, staff_id, plan_id, template_name, valid_days, subtotal, discount_amount, tax_amount, total_amount, notes, status)
            VALUES ('QT-2026-002', 4, 2, 2, 'Enterprise Annual Discounted Proposal', 45, 12500.0, 1250.0, 2025.0, 13275.0, 'Includes 10% volume discount', 'Sent')
        """)
        cursor.execute("""
            INSERT INTO quotations (quote_number, customer_id, staff_id, plan_id, template_name, valid_days, subtotal, discount_amount, tax_amount, total_amount, notes, status)
            VALUES ('QT-2026-003', 5, 2, 1, 'Standard SaaS Subscription Offer', 15, 1200.0, 0.0, 216.0, 1416.0, 'Awaiting customer review', 'Draft')
        """)

        # 10. Seed Invoices
        cursor.execute("""
            INSERT INTO invoices (invoice_number, subscription_id, customer_id, issue_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, paid_amount, notes)
            VALUES ('INV-2026-001', 1, 3, '2026-10-01', '2026-10-31', 'Paid', 1760.0, 298.8, 100.0, 1958.8, 1958.8, 'October 2026 monthly billing')
        """)
        inv_id = cursor.lastrowid
        cursor.execute("""
            INSERT INTO payments (invoice_id, amount, method, payment_date, note, transaction_ref)
            VALUES (?, 1958.8, 'Bank Transfer', '2026-10-02', 'Payment received via Wire Transfer from Anna Jones', 'TXN-994821')
        """, (inv_id,))

        cursor.execute("""
            INSERT INTO invoices (invoice_number, subscription_id, customer_id, issue_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, paid_amount, notes)
            VALUES ('INV-2026-002', 2, 4, '2026-10-15', '2026-11-15', 'Confirmed', 12500.0, 2025.0, 1250.0, 13275.0, 0.0, 'Annual enterprise billing pending payment')
        """)

        cursor.execute("""
            INSERT INTO invoices (invoice_number, subscription_id, customer_id, issue_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, paid_amount, notes)
            VALUES ('INV-2026-003', 3, 5, '2026-10-25', '2026-10-30', 'Draft', 1200.0, 216.0, 0.0, 1416.0, 0.0, 'Billing run preview')
        """)

        cursor.execute("""
            INSERT INTO invoices (invoice_number, subscription_id, customer_id, issue_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, paid_amount, notes)
            VALUES ('INV-2026-004', 1, 3, '2026-09-01', '2026-09-15', 'Confirmed', 850.0, 153.0, 50.0, 953.0, 0.0, 'Overdue prior invoice')
        """)

        print("Database seeded successfully with Brightloop test dataset!")

if __name__ == "__main__":
    from app.database import init_db
    init_db()
    seed_database()
