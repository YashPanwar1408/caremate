from __future__ import annotations
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from ..schemas.auth import SignupRequest, LoginRequest, AuthResponse, UserOut
from ..utils.state import save_user, get_user_by_email

# Password hashing
try:  # pragma: no cover
    from passlib.context import CryptContext  # type: ignore
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception:  # pragma: no cover
    _pwd_context = None  # type: ignore

import hashlib

# JWT
try:  # pragma: no cover
    from jose import jwt  # type: ignore
except Exception:  # pragma: no cover
    jwt = None  # type: ignore

ALGORITHM = "HS256"

router = APIRouter()


def hash_password(password: str) -> str:
    if _pwd_context:
        return _pwd_context.hash(password)
    # Fallback SHA256 (less secure; for local-only dev)
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    if _pwd_context:
        return _pwd_context.verify(password, hashed)
    return hashlib.sha256(password.encode("utf-8")).hexdigest() == hashed


def create_access_token(data: Dict[str, Any], expires_minutes: int = 60) -> str:
    secret = os.getenv("SECRET_KEY", "dev-secret-key")
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    if jwt:
        return jwt.encode(to_encode, secret, algorithm=ALGORITHM)
    # Fallback non-JWT token for dev
    return f"mock-{uuid.uuid4()}"


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest) -> AuthResponse:
    existing = get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = {
        "email": payload.email,
        "name": payload.name,
        "password_hash": hash_password(payload.password),
    }
    uid = save_user(user)
    token = create_access_token({"sub": uid, "email": payload.email})
    return AuthResponse(access_token=token, user=UserOut(id=uid, email=payload.email, name=payload.name))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    user = get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    uid = user.get("id")
    token = create_access_token({"sub": uid, "email": payload.email})
    return AuthResponse(access_token=token, user=UserOut(id=uid, email=payload.email, name=user.get("name")))
