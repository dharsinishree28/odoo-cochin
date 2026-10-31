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
