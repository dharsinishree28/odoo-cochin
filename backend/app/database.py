import sqlite3
import os
from contextlib import contextmanager
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "brightloop.db")

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users table (Admin, Staff, Customer)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'customer')),
            phone TEXT,
            avatar_url TEXT,
            company_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Products table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'service',
            sales_price REAL NOT NULL,
            cost_price REAL NOT NULL DEFAULT 0.0,
            notes TEXT,
            brand TEXT DEFAULT 'Standard'
        );
        """)

        # 3. Product Variants (e.g. Odoo brand adds 560 to price)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS product_variants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            variant_name TEXT NOT NULL,
            price_extra REAL NOT NULL DEFAULT 0.0
        );
        """)

        # 4. Plans table (daily, weekly, monthly, yearly, auto-close, pause, renew)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
            billing_frequency TEXT NOT NULL CHECK(billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
            cost REAL NOT NULL,
            min_quantity INTEGER NOT NULL DEFAULT 1,
            available_from DATE,
            available_until DATE,
            auto_close BOOLEAN NOT NULL DEFAULT 0,
            can_pause BOOLEAN NOT NULL DEFAULT 1,
            can_renew BOOLEAN NOT NULL DEFAULT 1,
            active BOOLEAN NOT NULL DEFAULT 1
        );
        """)

        # 5. Quotation Templates
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quotation_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
            default_valid_days INTEGER NOT NULL DEFAULT 30,
            notes TEXT
        );
        """)

        # 6. Quotations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_number TEXT UNIQUE NOT NULL,
            customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
            template_name TEXT,
            valid_days INTEGER NOT NULL DEFAULT 30,
            subtotal REAL NOT NULL DEFAULT 0.0,
            discount_amount REAL NOT NULL DEFAULT 0.0,
            tax_amount REAL NOT NULL DEFAULT 0.0,
            total_amount REAL NOT NULL DEFAULT 0.0,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Sent', 'Accepted', 'Rejected')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 7. Quotation Lines
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quotation_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id),
            variant_id INTEGER REFERENCES product_variants(id),
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price REAL NOT NULL,
            tax_rate REAL NOT NULL DEFAULT 0.0,
            line_total REAL NOT NULL
        );
        """)

        # 8. Subscriptions table (Draft -> Quotation -> Confirmed -> Active -> Closed)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_number TEXT UNIQUE NOT NULL,
            quotation_id INTEGER REFERENCES quotations(id) ON DELETE SET NULL,
            customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            plan_id INTEGER NOT NULL REFERENCES plans(id),
            status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Quotation', 'Confirmed', 'Active', 'Closed')),
            start_date DATE NOT NULL,
            expiry_date DATE,
            payment_terms TEXT DEFAULT 'Net 30',
            subtotal REAL NOT NULL DEFAULT 0.0,
            discount_amount REAL NOT NULL DEFAULT 0.0,
            tax_amount REAL NOT NULL DEFAULT 0.0,
            total_amount REAL NOT NULL DEFAULT 0.0,
            billing_cycle TEXT NOT NULL DEFAULT 'monthly',
            is_paused BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 9. Subscription Lines
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS subscription_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id),
            variant_id INTEGER REFERENCES product_variants(id),
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price REAL NOT NULL,
            tax_rate REAL NOT NULL DEFAULT 0.0,
            line_total REAL NOT NULL
        );
        """)

        # 10. Invoices table (Draft -> Confirmed -> Paid, Cancelled)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_number TEXT UNIQUE NOT NULL,
            subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
            customer_id INTEGER NOT NULL REFERENCES users(id),
            issue_date DATE NOT NULL,
            due_date DATE NOT NULL,
            status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Confirmed', 'Paid', 'Cancelled')),
            subtotal REAL NOT NULL DEFAULT 0.0,
            tax_amount REAL NOT NULL DEFAULT 0.0,
            discount_amount REAL NOT NULL DEFAULT 0.0,
            total_amount REAL NOT NULL DEFAULT 0.0,
            paid_amount REAL NOT NULL DEFAULT 0.0,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 11. Invoice Lines
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoice_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id),
            variant_id INTEGER REFERENCES product_variants(id),
            description TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price REAL NOT NULL,
            tax_rate REAL NOT NULL DEFAULT 0.0,
            line_total REAL NOT NULL
        );
        """)

        # 12. Payments table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
            amount REAL NOT NULL,
            method TEXT NOT NULL CHECK(method IN ('Bank Transfer', 'Credit Card', 'UPI', 'Stripe', 'Cash')),
            payment_date DATE NOT NULL,
            note TEXT,
            transaction_ref TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 13. Discount Rules table (fixed/percentage, min qty, min purchase, limits)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS discount_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            rule_type TEXT NOT NULL CHECK(rule_type IN ('fixed', 'percentage')),
            discount_value REAL NOT NULL,
            min_purchase REAL NOT NULL DEFAULT 0.0,
            min_quantity INTEGER NOT NULL DEFAULT 1,
            start_date DATE,
            end_date DATE,
            usage_limit INTEGER DEFAULT 100,
            times_used INTEGER NOT NULL DEFAULT 0,
            target_type TEXT NOT NULL DEFAULT 'whole_subscription' CHECK(target_type IN ('whole_subscription', 'specific_product')),
            target_product_id INTEGER REFERENCES products(id),
            is_active BOOLEAN NOT NULL DEFAULT 1
        );
        """)

        # 14. Tax Rules table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tax_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            rate REAL NOT NULL,
            country TEXT DEFAULT 'India',
            is_default BOOLEAN NOT NULL DEFAULT 0
        );
        """)

        # 15. Password Resets table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN NOT NULL DEFAULT 0
        );
        """)
