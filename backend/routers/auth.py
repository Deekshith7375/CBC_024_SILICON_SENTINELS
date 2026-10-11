from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Query, status
from backend.database import db

router = APIRouter(prefix="/auth", tags=["User Authentication (MongoDB)"])


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "customer"  # "customer" or "shop_owner"
    store_name: Optional[str] = None
    shop_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None  # Optional check for "customer" or "shop_owner"


class GoogleSyncRequest(BaseModel):
    name: str
    email: str
    role: str = "customer"
    store_name: Optional[str] = None


@router.post("/register")
def register(payload: RegisterRequest):
    """
    Register a new Customer or Shop Owner in MongoDB Atlas:
    - Stores name, email, hashed password, role, store_name, and timestamps.
    """
    try:
        user = db.register_user(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            role=payload.role,
            store_name=payload.store_name,
            shop_id=payload.shop_id
        )
        return {
            "success": True,
            "message": f"{payload.role.replace('_', ' ').title()} account registered successfully!",
            "user": user
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login")
def login(payload: LoginRequest):
    """
    Authenticate Customer or Shop Owner against MongoDB Atlas:
    - Validates email and bcrypt password hash.
    - Returns sanitized profile and role.
    """
    user = db.authenticate_user(
        email=payload.email,
        password=payload.password,
        role=payload.role
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    return {
        "success": True,
        "message": f"Welcome back, {user.get('name')}!",
        "user": user
    }


@router.post("/google")
def google_sync(payload: GoogleSyncRequest):
    """
    Sync or login Customer or Shop Owner authenticated via Google:
    - Persists Google profile in MongoDB Atlas.
    """
    user = db.sync_google_user(
        name=payload.name,
        email=payload.email,
        role=payload.role,
        store_name=payload.store_name
    )
    return {
        "success": True,
        "message": f"Authenticated via Google as {user.get('name')}",
        "user": user
    }


@router.get("/users")
def list_users(role: Optional[str] = Query(None)):
    """List registered users from MongoDB Atlas."""
    return db.list_users(role=role)


@router.get("/me")
def get_user_profile(email: str = Query(...)):
    """Fetch profile for a specific user email."""
    user = db.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    sanitized = dict(user)
    sanitized.pop("password_hash", None)
    sanitized.pop("_id", None)
    return sanitized
