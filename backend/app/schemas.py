from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional
import re

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "customer" # admin, staff, customer
    company_name: Optional[str] = None
    phone: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        # Scene 1: "more than eight characters, with an uppercase letter, a lowercase letter and a special character"
        if len(v) <= 8:
            raise ValueError("Password must be more than 8 characters long")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'[^A-Za-z0-9]', v):
            raise ValueError("Password must contain at least one special character")
        return v

class PasswordResetRequest(BaseModel):
    email: str

class ProductVariantCreate(BaseModel):
    variant_name: str
    price_extra: float = 0.0

class ProductCreate(BaseModel):
    name: str
    type: str = "service"
    sales_price: float
    cost_price: float = 0.0
    notes: Optional[str] = None
    brand: Optional[str] = "Brightloop"
    variants: Optional[List[ProductVariantCreate]] = []

class PlanCreate(BaseModel):
    name: str
    product_id: Optional[int] = None
    billing_frequency: str = "monthly" # daily, weekly, monthly, yearly
    cost: float
    min_quantity: int = 1
    available_from: Optional[str] = None
    available_until: Optional[str] = None
    auto_close: bool = False
    can_pause: bool = True
    can_renew: bool = True

class QuotationLineCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1
    unit_price: float
    tax_rate: float = 18.0

class QuotationCreate(BaseModel):
    customer_id: int
    staff_id: Optional[int] = None
    plan_id: Optional[int] = None
    template_name: Optional[str] = "Standard SaaS Offer"
    valid_days: int = 30
    lines: List[QuotationLineCreate] = []
    discount_code: Optional[str] = None
    notes: Optional[str] = None

class SubscriptionStatusUpdate(BaseModel):
    status: str # Draft, Quotation, Confirmed, Active, Closed
    is_paused: Optional[bool] = None

class InvoiceCreate(BaseModel):
    subscription_id: int
    issue_date: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(BaseModel):
    invoice_id: int
    amount: float
    method: str = "Bank Transfer" # Bank Transfer, Credit Card, UPI, Stripe, Cash
    note: Optional[str] = None

class DiscountRuleCreate(BaseModel):
    name: str
    code: str
    rule_type: str = "percentage" # percentage, fixed
    discount_value: float
    min_purchase: float = 0.0
    min_quantity: int = 1
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    usage_limit: int = 100
    target_type: str = "whole_subscription"
    target_product_id: Optional[int] = None
