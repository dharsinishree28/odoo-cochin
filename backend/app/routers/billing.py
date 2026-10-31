from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import InvoiceCreate, PaymentCreate, DiscountRuleCreate
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

# --- INVOICES (Scene 4) ---
@router.get("/invoices")
def list_invoices(customer_id: int = None, status: str = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT i.*, 
                   c.full_name as customer_name, c.company_name, c.email as customer_email,
                   s.subscription_number, p.name as plan_name
            FROM invoices i
            JOIN subscriptions s ON i.subscription_id = s.id
            JOIN users c ON i.customer_id = c.id
            JOIN plans p ON s.plan_id = p.id
        """
        conditions = []
        params = []
        if customer_id:
            conditions.append("i.customer_id = ?")
            params.append(customer_id)
        if status:
            conditions.append("i.status = ?")
            params.append(status)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY i.id DESC"
        
        cursor.execute(query, params)
        invoices = [dict(row) for row in cursor.fetchall()]
        
        for inv in invoices:
            cursor.execute("""
                SELECT il.*, pr.name as product_name
                FROM invoice_lines il
                LEFT JOIN products pr ON il.product_id = pr.id
                WHERE il.invoice_id = ?
            """, (inv["id"],))
            inv["lines"] = [dict(l) for l in cursor.fetchall()]
            
            cursor.execute("SELECT * FROM payments WHERE invoice_id = ?", (inv["id"],))
            inv["payments"] = [dict(p) for p in cursor.fetchall()]
            
        return invoices

@router.post("/generate-batch-billing")
def generate_batch_billing():
    """Scene 4: Billing Day - automatically generate invoices from all active subscriptions due for billing"""
    generated = []
    with get_db() as conn:
        cursor = conn.cursor()
        # Find active subscriptions that don't have an unpaid/draft invoice generated for this cycle
        cursor.execute("""
            SELECT s.*, c.id as cust_id 
            FROM subscriptions s
            JOIN users c ON s.customer_id = c.id
            WHERE s.status = 'Active' AND s.is_paused = 0
        """)
        active_subs = cursor.fetchall()
        
        today = datetime.now().date()
        due_date = today + timedelta(days=15)
        
        for sub in active_subs:
            s = dict(sub)
            
            # Check if an invoice for today already exists to prevent duplicate billing
            cursor.execute("""
                SELECT id FROM invoices 
                WHERE subscription_id = ? AND issue_date = ?
            """, (s["id"], str(today)))
            if cursor.fetchone():
                continue
                
            inv_number = f"INV-2026-{random.randint(1000, 9999)}"
            
            # Calculate automatic tax from tax_rules
            cursor.execute("SELECT rate FROM tax_rules WHERE is_default = 1")
            tax_rule = cursor.fetchone()
            tax_rate = tax_rule["rate"] if tax_rule else 18.0
            
            subtotal = s["subtotal"]
            discount_amount = s["discount_amount"]
            taxable = max(0.0, subtotal - discount_amount)
            tax_amount = taxable * (tax_rate / 100.0)
            total = taxable + tax_amount
            
            cursor.execute("""
                INSERT INTO invoices (
                    invoice_number, subscription_id, customer_id, issue_date, due_date,
                    status, subtotal, tax_amount, discount_amount, total_amount, paid_amount, notes
                ) VALUES (?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?, 0.0, 'Automated Billing Run Invoice')
            """, (inv_number, s["id"], s["customer_id"], str(today), str(due_date), subtotal, tax_amount, discount_amount, total))
            
            inv_id = cursor.lastrowid
            
            # Copy subscription lines into invoice lines
            cursor.execute("SELECT * FROM subscription_lines WHERE subscription_id = ?", (s["id"],))
            lines = cursor.fetchall()
            for l in lines:
                line = dict(l)
                cursor.execute("""
                    INSERT INTO invoice_lines (invoice_id, product_id, variant_id, description, quantity, unit_price, tax_rate, line_total)
                    VALUES (?, ?, ?, 'Recurring subscription item', ?, ?, ?, ?)
                """, (inv_id, line["product_id"], line["variant_id"], line["quantity"], line["unit_price"], line["tax_rate"], line["line_total"]))
                
            generated.append(inv_number)
            
        return {
            "message": f"Billing day run completed. {len(generated)} invoices generated.",
            "invoices": generated
        }

@router.patch("/invoices/{invoice_id}/status")
def update_invoice_status(invoice_id: int, status: str):
    # Draft -> Confirmed -> Paid, Cancelled
    if status not in ['Draft', 'Confirmed', 'Paid', 'Cancelled']:
        raise HTTPException(status_code=400, detail="Invalid invoice status")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE invoices SET status = ? WHERE id = ?", (status, invoice_id))
        return {"message": f"Invoice {invoice_id} status updated to {status}"}

# --- PAYMENTS (Scene 6) ---
@router.post("/payments")
def record_payment(payment: PaymentCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM invoices WHERE id = ?", (payment.invoice_id,))
        invoice = cursor.fetchone()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        inv = dict(invoice)
        
        today = datetime.now().date()
        ref = f"TXN-{random.randint(100000, 999999)}"
        cursor.execute("""
            INSERT INTO payments (invoice_id, amount, method, payment_date, note, transaction_ref)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (payment.invoice_id, payment.amount, payment.method, str(today), payment.note, ref))
        
        new_paid = inv["paid_amount"] + payment.amount
        new_status = 'Paid' if new_paid >= inv["total_amount"] else inv["status"]
        
        cursor.execute("""
            UPDATE invoices 
            SET paid_amount = ?, status = ?
            WHERE id = ?
        """, (new_paid, new_status, payment.invoice_id))
        
        return {
            "message": "Payment recorded successfully",
            "transaction_ref": ref,
            "new_paid_amount": new_paid,
            "invoice_status": new_status
        }

# --- DISCOUNT RULES (Scene 5) ---
@router.get("/discounts")
def list_discounts():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM discount_rules ORDER BY id DESC")
        return [dict(r) for r in cursor.fetchall()]

@router.post("/discounts")
def create_discount_rule(rule: DiscountRuleCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        today = str(datetime.now().date())
        cursor.execute("""
            INSERT INTO discount_rules (
                name, code, rule_type, discount_value, min_purchase, min_quantity,
                start_date, end_date, usage_limit, times_used, target_type, target_product_id, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 1)
        """, (
            rule.name, rule.code.upper(), rule.rule_type, rule.discount_value,
            rule.min_purchase, rule.min_quantity,
            rule.start_date or today, rule.end_date,
            rule.usage_limit, rule.target_type, rule.target_product_id
        ))
        return {"message": "Discount rule created", "id": cursor.lastrowid}
