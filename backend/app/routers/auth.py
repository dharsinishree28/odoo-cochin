from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db
from app.schemas import UserLogin, UserRegister, PasswordResetRequest
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Optional, List

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

# Secure salt for password hashing
SALT = "odoo_cochin_brightloop_2026_salt"

def hash_pw(pw: str, salt: str = SALT) -> str:
    """Generate salted SHA-256 password hash."""
    return hashlib.sha256(f"{salt}:{pw}".encode("utf-8")).hexdigest()

def verify_pw(input_pw: str, stored_hash: str) -> bool:
    """Verify password against salted hash, with legacy fallback."""
    # 1. Salted hash check
    if hash_pw(input_pw) == stored_hash:
        return True
    # 2. Legacy unsalted hash check (for backward compatibility)
    if hashlib.sha256(input_pw.encode("utf-8")).hexdigest() == stored_hash:
        return True
    return False

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Authenticate request using Bearer session token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = credentials.credentials
    with get_db() as conn:
        cursor = conn.cursor()
        # Verify active session in user_sessions
        cursor.execute("""
            SELECT s.token, s.user_id, s.role, s.expires_at,
                   u.id, u.email, u.full_name, u.phone, u.avatar_url, u.company_name
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > ?
        """, (token, datetime.now()))
        row = cursor.fetchone()
        
        if row:
            return {
                "id": row["id"],
                "email": row["email"],
                "full_name": row["full_name"],
                "role": row["role"],
                "phone": row["phone"],
                "avatar_url": row["avatar_url"],
                "company_name": row["company_name"]
            }
        
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please sign in again.")
        
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please sign in again.")

def require_role(allowed_roles: List[str]):
    """Authorization dependency verifying user has one of the allowed roles."""
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied: '{current_user.get('role')}' role is not authorized for this resource."
            )
        return current_user
    return role_checker

@router.post("/login")
def login(creds: UserLogin):
    email = creds.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email, password_hash, full_name, role, phone, avatar_url, company_name
            FROM users
            WHERE LOWER(email) = ?
        """, (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_dict = dict(user)
        stored_hash = user_dict.pop("password_hash")
        
        if not verify_pw(creds.password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Upgrade legacy hash to salted hash if needed
        salted = hash_pw(creds.password)
        if stored_hash != salted:
            cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (salted, user_dict["id"]))
        
        # Strict portal validation: verify that assigned role matches selected portal
        if creds.portal:
            requested_portal = creds.portal.strip().lower()
            if user_dict["role"] != requested_portal:
                raise HTTPException(
                    status_code=403,
                    detail=f"Account is not authorized for the {creds.portal.capitalize()} portal. Assigned role is {user_dict['role'].capitalize()}."
                )
        
        # Create persistent session token
        token = f"jwt_{user_dict['role']}_{user_dict['id']}_{uuid.uuid4().hex}"
        expires_at = datetime.now() + timedelta(days=7)
        cursor.execute("""
            INSERT OR REPLACE INTO user_sessions (token, user_id, role, expires_at)
            VALUES (?, ?, ?, ?)
        """, (token, user_dict["id"], user_dict["role"], expires_at))
        
        return {
            "token": token,
            "user": user_dict
        }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return {"user": current_user}

@router.post("/logout")
def logout(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Invalidate current session token."""
    if credentials and credentials.credentials:
        token = credentials.credentials
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
    return {"message": "Session invalidated successfully"}

@router.post("/register")
def register(data: UserRegister):
    pw_hash = hash_pw(data.password)
    with get_db() as conn:
        cursor = conn.cursor()
        # Check email uniqueness
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (data.email.strip().lower(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists")
        
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role, phone, company_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (data.email.strip().lower(), pw_hash, data.full_name, data.role, data.phone, data.company_name))
        
        user_id = cursor.lastrowid
        cursor.execute("SELECT id, email, full_name, role, phone, avatar_url, company_name FROM users WHERE id = ?", (user_id,))
        user_dict = dict(cursor.fetchone())
        
        token = f"jwt_{user_dict['role']}_{user_dict['id']}_{uuid.uuid4().hex}"
        expires_at = datetime.now() + timedelta(days=7)
        cursor.execute("""
            INSERT INTO user_sessions (token, user_id, role, expires_at)
            VALUES (?, ?, ?, ?)
        """, (token, user_dict["id"], user_dict["role"], expires_at))

        return {
            "message": "Account created successfully",
            "token": token,
            "user": user_dict
        }

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (req.email.strip().lower(),))
        user = cursor.fetchone()
        if not user:
            return {"message": "If this email is registered, a password reset link has been sent."}
        
        token = uuid.uuid4().hex
        expires_at = datetime.now() + timedelta(hours=2)
        cursor.execute("""
            INSERT INTO password_resets (email, token, expires_at)
            VALUES (?, ?, ?)
        """, (req.email.strip().lower(), token, expires_at))
        
        return {
            "message": "Password reset link sent to your registered email",
            "mock_reset_link": f"https://brightloop.software/reset-password?token={token}"
        }

@router.get("/users")
def get_users(role: str = None, current_user: dict = Depends(require_role(["admin", "staff"]))):
    """Retrieve users list. Restricted to Admin and Staff."""
    with get_db() as conn:
        cursor = conn.cursor()
        if role:
            cursor.execute("SELECT id, email, full_name, role, phone, company_name, created_at FROM users WHERE role = ?", (role,))
        else:
            cursor.execute("SELECT id, email, full_name, role, phone, company_name, created_at FROM users")
        return [dict(r) for r in cursor.fetchall()]
