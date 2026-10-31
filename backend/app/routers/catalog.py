from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import ProductCreate, ProductVariantCreate, PlanCreate
from typing import Optional

router = APIRouter(prefix="/api/v1/catalog", tags=["catalog"])

@router.get("/products")
def list_products():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products ORDER BY id ASC")
        products = [dict(p) for p in cursor.fetchall()]
        
        for p in products:
            cursor.execute("SELECT * FROM product_variants WHERE product_id = ?", (p["id"],))
            p["variants"] = [dict(v) for v in cursor.fetchall()]
        
        return products

@router.post("/products")
def create_product(prod: ProductCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (name, type, sales_price, cost_price, notes, brand)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (prod.name, prod.type, prod.sales_price, prod.cost_price, prod.notes, prod.brand))
        product_id = cursor.lastrowid
        
        if prod.variants:
            for v in prod.variants:
                cursor.execute("""
                    INSERT INTO product_variants (product_id, variant_name, price_extra)
                    VALUES (?, ?, ?)
                """, (product_id, v.variant_name, v.price_extra))
        
        return {"message": "Product created successfully", "id": product_id}

@router.post("/products/{product_id}/variants")
def add_variant(product_id: int, var: ProductVariantCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO product_variants (product_id, variant_name, price_extra)
            VALUES (?, ?, ?)
        """, (product_id, var.variant_name, var.price_extra))
        return {"message": "Variant added", "id": cursor.lastrowid}

@router.get("/plans")
def list_plans(active_only: bool = False):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT p.*, pr.name as product_name, pr.sales_price as base_product_price
            FROM plans p
            LEFT JOIN products pr ON p.product_id = pr.id
        """
        if active_only:
            query += " WHERE p.active = 1"
        query += " ORDER BY p.id ASC"
        cursor.execute(query)
        return [dict(row) for row in cursor.fetchall()]

@router.post("/plans")
def create_plan(plan: PlanCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO plans (name, product_id, billing_frequency, cost, min_quantity, available_from, available_until, auto_close, can_pause, can_renew)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (plan.name, plan.product_id, plan.billing_frequency, plan.cost, plan.min_quantity, plan.available_from, plan.available_until, plan.auto_close, plan.can_pause, plan.can_renew))
        return {"message": "Plan launched successfully", "id": cursor.lastrowid}

@router.patch("/plans/{plan_id}/toggle-active")
def toggle_plan(plan_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE plans SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?", (plan_id,))
        return {"message": "Plan status updated"}
