from fastapi import APIRouter
from app.database import get_db
from datetime import datetime

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

@router.get("/dashboard")
def get_dashboard_summary():
    """Scene 7: Fast finance lead metrics responding in under two seconds"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Active Subscriptions count & MRR
        cursor.execute("SELECT COUNT(*) as active_count, SUM(total_amount) as mrr FROM subscriptions WHERE status = 'Active'")
        sub_row = cursor.fetchone()
        active_subscriptions = sub_row["active_count"] or 0
        total_mrr = sub_row["mrr"] or 0.0
        
        # 2. Total Subscriptions by status
        cursor.execute("SELECT status, COUNT(*) as count FROM subscriptions GROUP BY status")
        status_breakdown = {r["status"]: r["count"] for r in cursor.fetchall()}
        
        # 3. Revenue collected vs Outstanding
        cursor.execute("SELECT SUM(paid_amount) as total_collected, SUM(total_amount - paid_amount) as total_owed FROM invoices WHERE status != 'Cancelled'")
        inv_row = cursor.fetchone()
        total_collected = inv_row["total_collected"] or 0.0
        total_owed = inv_row["total_owed"] or 0.0
        
        # 4. Overdue Invoices
        today = str(datetime.now().date())
        cursor.execute("""
            SELECT i.*, c.full_name as customer_name, c.company_name
            FROM invoices i
            JOIN users c ON i.customer_id = c.id
            WHERE i.status = 'Confirmed' AND i.due_date < ?
        """, (today,))
        overdue_invoices = [dict(r) for r in cursor.fetchall()]
        
        # 5. Conversion Rate (Quotation -> Accepted)
        cursor.execute("SELECT COUNT(*) FROM quotations")
        total_quotes = cursor.fetchone()[0] or 1
        cursor.execute("SELECT COUNT(*) FROM quotations WHERE status = 'Accepted'")
        accepted_quotes = cursor.fetchone()[0] or 0
        win_rate = round((accepted_quotes / total_quotes) * 100, 1)
        
        # 6. Reference Dashboard KPIs (matching screenshot values)
        return {
            "finance_lead": {
                "active_subscriptions": active_subscriptions,
                "mrr": round(total_mrr, 2),
                "total_revenue_collected": round(total_collected, 2),
                "total_owed": round(total_owed, 2),
                "overdue_count": len(overdue_invoices),
                "overdue_invoices": overdue_invoices,
                "win_rate": win_rate,
                "status_breakdown": status_breakdown
            },
            "reference_kpis": {
                "spent_this_month": 682.50,
                "new_clients": 321,
                "earnings": 350.40,
                "activity_total": 540.50,
                "balance": 52422.00,
                "balance_change": -4.75,
                "saves_rate": 43.50,
                "saves_change": 2.45,
                "earnings_total_expense": 6078.76,
                "earnings_profit_progress": 80,
                "user_profile": {
                    "name": "Carlic Bolomboy",
                    "email": "carlic@gmai.com",
                    "projects": 26,
                    "followers": 356,
                    "following": 68
                },
                "transfers": [
                    {"name": "From Anna Jones", "time": "Today, 14:34", "change": "+2.45%", "positive": True},
                    {"name": "To Carlos Brown III", "time": "Today, 15:23", "change": "-4.75%", "positive": False},
                    {"name": "From Joel Cannan", "time": "Today, 17:54", "change": "+2.45%", "positive": True}
                ]
            }
        }
