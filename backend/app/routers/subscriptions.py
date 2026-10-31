from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import SubscriptionStatusUpdate
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/subscriptions", tags=["subscriptions"])

@router.get("")
def list_subscriptions(customer_id: int = None, status: str = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT s.*, 
                   c.full_name as customer_name, c.company_name, c.email as customer_email,
                   p.name as plan_name, p.billing_frequency, p.can_pause, p.can_renew, p.auto_close
            FROM subscriptions s
            JOIN users c ON s.customer_id = c.id
            JOIN plans p ON s.plan_id = p.id
        """
        conditions = []
        params = []
        if customer_id:
            conditions.append("s.customer_id = ?")
            params.append(customer_id)
        if status:
            conditions.append("s.status = ?")
            params.append(status)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY s.id DESC"
        
        cursor.execute(query, params)
        subs = [dict(row) for row in cursor.fetchall()]
        
        for s in subs:
            cursor.execute("""
                SELECT sl.*, pr.name as product_name, pv.variant_name
                FROM subscription_lines sl
                JOIN products pr ON sl.product_id = pr.id
                LEFT JOIN product_variants pv ON sl.variant_id = pv.id
                WHERE sl.subscription_id = ?
            """, (s["id"],))
            s["lines"] = [dict(line) for line in cursor.fetchall()]
            
        return subs

@router.get("/{sub_id}")
def get_subscription(sub_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.*, 
                   c.full_name as customer_name, c.company_name, c.email as customer_email,
                   p.name as plan_name, p.billing_frequency
            FROM subscriptions s
            JOIN users c ON s.customer_id = c.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.id = ?
        """, (sub_id,))
        sub = cursor.fetchone()
        if not sub:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        s_dict = dict(sub)
        cursor.execute("""
            SELECT sl.*, pr.name as product_name, pv.variant_name
            FROM subscription_lines sl
            JOIN products pr ON sl.product_id = pr.id
            LEFT JOIN product_variants pv ON sl.variant_id = pv.id
            WHERE sl.subscription_id = ?
        """, (sub_id,))
        s_dict["lines"] = [dict(l) for l in cursor.fetchall()]
        return s_dict

@router.patch("/{sub_id}/status")
def update_status(sub_id: int, update: SubscriptionStatusUpdate):
    # Lifecycle: Draft -> Quotation -> Confirmed -> Active -> Closed
    valid_statuses = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed']
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    with get_db() as conn:
        cursor = conn.cursor()
        if update.is_paused is not None:
            cursor.execute("""
                UPDATE subscriptions 
                SET status = ?, is_paused = ?
                WHERE id = ?
            """, (update.status, 1 if update.is_paused else 0, sub_id))
        else:
            cursor.execute("UPDATE subscriptions SET status = ? WHERE id = ?", (update.status, sub_id))
            
        return {"message": f"Subscription updated to {update.status}"}

@router.post("/{sub_id}/pause")
def toggle_pause(sub_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT is_paused, status FROM subscriptions WHERE id = ?", (sub_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Subscription not found")
        new_paused = 0 if row["is_paused"] else 1
        cursor.execute("UPDATE subscriptions SET is_paused = ? WHERE id = ?", (new_paused, sub_id))
        return {"message": "Subscription paused" if new_paused else "Subscription resumed", "is_paused": bool(new_paused)}

@router.post("/{sub_id}/renew")
def renew_subscription(sub_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT expiry_date, billing_cycle FROM subscriptions WHERE id = ?", (sub_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Subscription not found")
            
        current_exp = datetime.strptime(row["expiry_date"], "%Y-%m-%d").date()
        days = 365 if row["billing_cycle"] == "yearly" else 30
        new_exp = current_exp + timedelta(days=days)
        cursor.execute("UPDATE subscriptions SET expiry_date = ?, status = 'Active' WHERE id = ?", (str(new_exp), sub_id))
        return {"message": f"Subscription renewed until {new_exp}", "new_expiry_date": str(new_exp)}

import random
from app.schemas import CustomerSubscribeRequest

@router.post("/subscribe")
def customer_subscribe(req: CustomerSubscribeRequest):
    today = datetime.now().date()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM plans WHERE id = ?", (req.plan_id,))
        plan = cursor.fetchone()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        plan_dict = dict(plan)
        
        # Verify customer exists
        cursor.execute("SELECT id, full_name, email FROM users WHERE id = ?", (req.customer_id,))
        cust = cursor.fetchone()
        if not cust:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Close previous active subscriptions for this customer
        cursor.execute("UPDATE subscriptions SET status = 'Closed' WHERE customer_id = ? AND status = 'Active'", (req.customer_id,))
        
        # Determine duration
        freq = plan_dict.get("billing_frequency", "monthly")
        days = 365 if freq == "yearly" else (7 if freq == "weekly" else 30)
        expiry = today + timedelta(days=days)
        sub_number = f"SUB-2026-{random.randint(1000, 9999)}"
        
        cost = float(plan_dict["cost"])
        tax_amount = round(cost * 0.18, 2)
        total_amount = round(cost + tax_amount, 2)
        
        cursor.execute("""
            INSERT INTO subscriptions (
                subscription_number, customer_id, plan_id, status, start_date, expiry_date,
                payment_terms, subtotal, discount_amount, tax_amount, total_amount, billing_cycle, is_paused
            ) VALUES (?, ?, ?, 'Active', ?, ?, 'Immediate', ?, 0.0, ?, ?, ?, 0)
        """, (
            sub_number, req.customer_id, req.plan_id, str(today), str(expiry),
            cost, tax_amount, total_amount, freq
        ))
        sub_id = cursor.lastrowid
        
        # Add subscription line
        prod_id = plan_dict.get("product_id") or 1
        cursor.execute("""
            INSERT INTO subscription_lines (subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, line_total)
            VALUES (?, ?, NULL, 1, ?, 18.0, ?)
        """, (sub_id, prod_id, cost, cost))
        
        # Generate confirmed paid invoice & payment record for purchase history & receipts
        inv_number = f"INV-2026-{random.randint(1000, 9999)}"
        cursor.execute("""
            INSERT INTO invoices (
                invoice_number, subscription_id, customer_id, issue_date, due_date,
                status, subtotal, tax_amount, discount_amount, total_amount, paid_amount, notes
            ) VALUES (?, ?, ?, ?, ?, 'Paid', ?, ?, 0.0, ?, ?, ?)
        """, (
            inv_number, sub_id, req.customer_id, str(today), str(today),
            cost, tax_amount, total_amount, total_amount, f"Plan subscription: {plan_dict['name']}"
        ))
        inv_id = cursor.lastrowid
        
        txn_ref = f"TXN-PLAN-{random.randint(100000, 999999)}"
        cursor.execute("""
            INSERT INTO payments (invoice_id, amount, method, payment_date, note, transaction_ref)
            VALUES (?, ?, 'Credit Card', ?, ?, ?)
        """, (inv_id, total_amount, str(today), f"Activated {plan_dict['name']}", txn_ref))
        
        return {
            "message": f"Successfully activated {plan_dict['name']}!",
            "subscription_id": sub_id,
            "subscription_number": sub_number,
            "plan_name": plan_dict["name"],
            "invoice_number": inv_number,
            "transaction_ref": txn_ref
        }
