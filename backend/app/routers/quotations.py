from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import QuotationCreate
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/v1/quotations", tags=["quotations"])

@router.get("")
def list_quotations(customer_id: int = None, staff_id: int = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT q.*, 
                   c.full_name as customer_name, c.company_name, c.email as customer_email,
                   s.full_name as staff_name,
                   p.name as plan_name, p.billing_frequency
            FROM quotations q
            JOIN users c ON q.customer_id = c.id
            LEFT JOIN users s ON q.staff_id = s.id
            LEFT JOIN plans p ON q.plan_id = p.id
        """
        params = []
        conditions = []
        if customer_id:
            conditions.append("q.customer_id = ?")
            params.append(customer_id)
        if staff_id:
            conditions.append("q.staff_id = ?")
            params.append(staff_id)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY q.id DESC"
        
        cursor.execute(query, params)
        quotes = [dict(row) for row in cursor.fetchall()]
        
        for q in quotes:
            cursor.execute("""
                SELECT ql.*, pr.name as product_name, pv.variant_name
                FROM quotation_lines ql
                JOIN products pr ON ql.product_id = pr.id
                LEFT JOIN product_variants pv ON ql.variant_id = pv.id
                WHERE ql.quotation_id = ?
            """, (q["id"],))
            q["lines"] = [dict(line) for line in cursor.fetchall()]
            
        return quotes

@router.post("")
def create_quotation(data: QuotationCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Calculate subtotal, taxes, discounts
        subtotal = 0.0
        tax_amount = 0.0
        for line in data.lines:
            lt = line.quantity * line.unit_price
            subtotal += lt
            tax_amount += lt * (line.tax_rate / 100.0)
            
        discount_amount = 0.0
        if data.discount_code:
            cursor.execute("""
                SELECT * FROM discount_rules 
                WHERE code = ? AND is_active = 1
            """, (data.discount_code,))
            rule = cursor.fetchone()
            if rule:
                r_dict = dict(rule)
                if r_dict["times_used"] < r_dict["usage_limit"]:
                    if r_dict["rule_type"] == "percentage":
                        discount_amount = subtotal * (r_dict["discount_value"] / 100.0)
                    else:
                        discount_amount = min(subtotal, r_dict["discount_value"])
                    # Increment discount rule times_used
                    cursor.execute("UPDATE discount_rules SET times_used = times_used + 1 WHERE id = ?", (r_dict["id"],))
        
        total_amount = max(0.0, subtotal - discount_amount + tax_amount)
        quote_num = f"QT-2026-{random.randint(1000, 9999)}"
        
        cursor.execute("""
            INSERT INTO quotations (
                quote_number, customer_id, staff_id, plan_id, template_name,
                valid_days, subtotal, discount_amount, tax_amount, total_amount,
                notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sent')
        """, (
            quote_num, data.customer_id, data.staff_id, data.plan_id, data.template_name,
            data.valid_days, subtotal, discount_amount, tax_amount, total_amount,
            data.notes
        ))
        quote_id = cursor.lastrowid
        
        for line in data.lines:
            lt = line.quantity * line.unit_price
            cursor.execute("""
                INSERT INTO quotation_lines (quotation_id, product_id, variant_id, quantity, unit_price, tax_rate, line_total)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (quote_id, line.product_id, line.variant_id, line.quantity, line.unit_price, line.tax_rate, lt))
            
        return {"message": "Quotation generated and sent to customer", "id": quote_id, "quote_number": quote_num}

@router.patch("/{quote_id}/status")
def update_quote_status(quote_id: int, status: str):
    if status not in ['Draft', 'Sent', 'Accepted', 'Rejected']:
        raise HTTPException(status_code=400, detail="Invalid status")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE quotations SET status = ? WHERE id = ?", (status, quote_id))
        return {"message": f"Quotation status updated to {status}"}

@router.post("/{quote_id}/convert-to-subscription")
def convert_to_subscription(quote_id: int):
    # Scene 3: Turning a quote into a subscription
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quotations WHERE id = ?", (quote_id,))
        quote = cursor.fetchone()
        if not quote:
            raise HTTPException(status_code=404, detail="Quotation not found")
        q = dict(quote)
        
        # Update quote status to Accepted
        cursor.execute("UPDATE quotations SET status = 'Accepted' WHERE id = ?", (quote_id,))
        
        # Get plan cycle
        cycle = "monthly"
        if q["plan_id"]:
            cursor.execute("SELECT billing_frequency FROM plans WHERE id = ?", (q["plan_id"],))
            plan_row = cursor.fetchone()
            if plan_row:
                cycle = plan_row["billing_frequency"]
        
        start_date = datetime.now().date()
        expiry_date = start_date + timedelta(days=365) if cycle == 'yearly' else start_date + timedelta(days=30)
        sub_number = f"SUB-2026-{random.randint(1000, 9999)}"
        
        cursor.execute("""
            INSERT INTO subscriptions (
                subscription_number, quotation_id, customer_id, plan_id,
                status, start_date, expiry_date, payment_terms,
                subtotal, discount_amount, tax_amount, total_amount,
                billing_cycle, is_paused
            ) VALUES (?, ?, ?, ?, 'Confirmed', ?, ?, 'Net 30', ?, ?, ?, ?, ?, 0)
        """, (
            sub_number, quote_id, q["customer_id"], q["plan_id"],
            str(start_date), str(expiry_date),
            q["subtotal"], q["discount_amount"], q["tax_amount"], q["total_amount"],
            cycle
        ))
        sub_id = cursor.lastrowid
        
        # Copy lines
        cursor.execute("SELECT * FROM quotation_lines WHERE quotation_id = ?", (quote_id,))
        lines = cursor.fetchall()
        for line in lines:
            l = dict(line)
            cursor.execute("""
                INSERT INTO subscription_lines (subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, line_total)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (sub_id, l["product_id"], l["variant_id"], l["quantity"], l["unit_price"], l["tax_rate"], l["line_total"]))
            
        return {
            "message": "Quotation successfully converted to subscription",
            "subscription_id": sub_id,
            "subscription_number": sub_number,
            "status": "Confirmed"
        }
