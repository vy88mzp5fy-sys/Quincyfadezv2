from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import hmac
import os
import secrets
import uuid

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field


class ClientSignup(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=7, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ClientLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


def build_client_auth_router(db):
    router = APIRouter(prefix="/client", tags=["client-auth"])
    session_hours = int(os.environ.get("CLIENT_SESSION_HOURS", "720"))

    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def _hash_password(password: str, salt_hex: Optional[str] = None) -> tuple[str, str]:
        salt = bytes.fromhex(salt_hex) if salt_hex else secrets.token_bytes(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 210_000)
        return salt.hex(), digest.hex()

    def _verify_password(password: str, salt_hex: str, expected_hex: str) -> bool:
        _, actual = _hash_password(password, salt_hex)
        return hmac.compare_digest(actual, expected_hex)

    async def _create_session(client_key: str) -> tuple[str, str]:
        token = secrets.token_urlsafe(40)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=session_hours)
        await db.client_sessions.insert_one({
            "id": str(uuid.uuid4()),
            "client_key": client_key,
            "token_hash": _hash_token(token),
            "created_at": datetime.now(timezone.utc),
            "expires_at": expires_at,
        })
        return token, expires_at.isoformat()

    async def _require_client(authorization: Optional[str] = Header(default=None)):
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Client authentication required.")
        token = authorization.split(" ", 1)[1].strip()
        session = await db.client_sessions.find_one({
            "token_hash": _hash_token(token),
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        }, {"_id": 0})
        if not session:
            raise HTTPException(status_code=401, detail="Your client session has expired. Please log in again.")
        account = await db.client_accounts.find_one({"client_key": session["client_key"]}, {"_id": 0, "password_hash": 0, "password_salt": 0})
        if not account:
            raise HTTPException(status_code=401, detail="Client account not found.")
        return account

    def _public_profile(account: dict) -> dict:
        return {
            "client_key": account["client_key"],
            "name": account.get("name") or "",
            "phone": account.get("phone") or "",
            "email": account.get("email") or "",
        }

    @router.post("/signup")
    async def signup(input: ClientSignup):
        email = str(input.email).strip().lower()
        existing = await db.client_accounts.find_one({"email": email}, {"_id": 1})
        if existing:
            raise HTTPException(status_code=409, detail="An account with that email already exists. Please log in instead.")
        client_key = f"qfz_{uuid.uuid4().hex}"
        salt, password_hash = _hash_password(input.password)
        now = datetime.now(timezone.utc)
        account = {
            "client_key": client_key,
            "name": input.name.strip(),
            "phone": input.phone.strip(),
            "email": email,
            "password_salt": salt,
            "password_hash": password_hash,
            "created_at": now,
            "updated_at": now,
        }
        try:
            await db.client_accounts.insert_one(account)
        except Exception as exc:
            if await db.client_accounts.find_one({"email": email}, {"_id": 1}):
                raise HTTPException(status_code=409, detail="An account with that email already exists. Please log in instead.") from exc
            raise
        await db.client_profiles.update_one(
            {"client_key": client_key},
            {"$set": {"client_key": client_key, "name": account["name"], "phone": account["phone"], "email": email, "updated_at": now.isoformat()}, "$setOnInsert": {"created_at": now.isoformat()}},
            upsert=True,
        )
        token, expires_at = await _create_session(client_key)
        return {"token": token, "expires_at": expires_at, "client_key": client_key, "profile": _public_profile(account)}

    @router.post("/login")
    async def login(input: ClientLogin):
        email = str(input.email).strip().lower()
        account = await db.client_accounts.find_one({"email": email}, {"_id": 0})
        if not account or not _verify_password(input.password, account.get("password_salt", ""), account.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Incorrect email or password.")
        token, expires_at = await _create_session(account["client_key"])
        return {"token": token, "expires_at": expires_at, "client_key": account["client_key"], "profile": _public_profile(account)}

    @router.get("/me")
    async def me(authorization: Optional[str] = Header(default=None)):
        account = await _require_client(authorization)
        return {"client_key": account["client_key"], "profile": _public_profile(account)}

    @router.post("/logout")
    async def logout(authorization: Optional[str] = Header(default=None)):
        if authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
            await db.client_sessions.delete_many({"token_hash": _hash_token(token)})
        return {"logged_out": True}

    return router
