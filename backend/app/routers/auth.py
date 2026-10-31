from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.schemas import UserLogin, UserRegister, PasswordResetRequest
import hashlib
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

@router.post("/login")
def login(creds: UserLogin):
    pw_hash = hash_pw(creds.password)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email, full_name, role, phone, avatar_url, company_name
            FROM users
            WHERE email = ? AND password_hash = ?
        """, (creds.email, pw_hash))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_dict = dict(user)
        # Mocking JWT token with bearer structure
        token = f"jwt_{user_dict['role']}_{user_dict['id']}_{uuid.uuid4().hex[:12]}"
        return {
            "token": token,
            "user": user_dict
        }

@router.post("/register")
def register(data: UserRegister):
    pw_hash = hash_pw(data.password)
    with get_db() as conn:
        cursor = conn.cursor()
        # Check email uniqueness
        cursor.execute("SELECT id FROM users WHERE email = ?", (data.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists")
        
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role, phone, company_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (data.email, pw_hash, data.full_name, data.role, data.phone, data.company_name))
        
        user_id = cursor.lastrowid
        cursor.execute("SELECT id, email, full_name, role, phone, avatar_url, company_name FROM users WHERE id = ?", (user_id,))
        user_dict = dict(cursor.fetchone())
        
        token = f"jwt_{user_dict['role']}_{user_dict['id']}_{uuid.uuid4().hex[:12]}"
        return {
            "message": "Account created successfully",
            "token": token,
            "user": user_dict
        }

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
        user = cursor.fetchone()
        if not user:
            # Even if user doesn't exist, respond gracefully
            return {"message": "If this email is registered, a password reset link has been sent."}
        
        token = uuid.uuid4().hex
        expires_at = datetime.now() + timedelta(hours=2)
        cursor.execute("""
            INSERT INTO password_resets (email, token, expires_at)
            VALUES (?, ?, ?)
        """, (req.email, token, expires_at))
        
        return {
            "message": "Password reset link sent to your registered email",
            "mock_reset_link": f"https://brightloop.software/reset-password?token={token}"
        }

@router.get("/users")
def get_users(role: str = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if role:
            cursor.execute("SELECT id, email, full_name, role, phone, company_name, created_at FROM users WHERE role = ?", (role,))
        else:
            cursor.execute("SELECT id, email, full_name, role, phone, company_name, created_at FROM users")
        return [dict(r) for r in cursor.fetchall()]
