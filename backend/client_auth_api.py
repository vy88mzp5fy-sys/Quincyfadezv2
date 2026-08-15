from datetime import datetime, timezone, timedelta
from typing import Optional
import base64
import hashlib
import hmac
import secrets
import uuid

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError


class ClientSignup(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=7, max_length=30)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class ClientLogin(BaseModel):
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class ClientPasswordChange(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


def build_client_auth_router(db):
    router = APIRouter(prefix="/client", tags=["client-auth"])
    indexes_ready = False

    async def ensure_indexes():
        nonlocal indexes_ready
        if indexes_ready:
            return
        await db.client_users.create_index("email_normalized", unique=True)
        await db.client_users.create_index("client_key", unique=True)
        await db.client_sessions.create_index("token_hash", unique=True)
        await db.client_sessions.create_index("expires_at", expireAfterSeconds=0)
        indexes_ready = True

    def normalize_email(value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or email.startswith("@") or email.endswith("@"):
            raise HTTPException(status_code=400, detail="Enter a valid email address.")
        return email

    def password_hash(password: str, salt: Optional[bytes] = None) -> tuple[str, str]:
        actual_salt = salt or secrets.token_bytes(16)
        derived = hashlib.scrypt(
            password.encode("utf-8"),
            salt=actual_salt,
            n=2**14,
            r=8,
            p=1,
            dklen=32,
        )
        return (
            base64.b64encode(actual_salt).decode("ascii"),
            base64.b64encode(derived).decode("ascii"),
        )

    def verify_password(password: str, salt_b64: str, expected_b64: str) -> bool:
        try:
            salt = base64.b64decode(salt_b64.encode("ascii"), validate=True)
            _, calculated = password_hash(password, salt)
            return hmac.compare_digest(calculated, expected_b64)
        except Exception:
            return False

    def hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    async def create_session(user: dict) -> dict:
        token = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=30)
        await db.client_sessions.insert_one({
            "id": str(uuid.uuid4()),
            "token_hash": hash_token(token),
            "client_user_id": user["id"],
            "client_key": user["client_key"],
            "created_at": now,
            "expires_at": expires,
        })
        return {
            "token": token,
            "expires_at": expires.isoformat(),
            "client_key": user["client_key"],
            "profile": {
                "id": user["id"],
                "client_key": user["client_key"],
                "name": user.get("name") or "",
                "phone": user.get("phone") or "",
                "email": user.get("email_normalized") or "",
            },
        }

    async def require_client(authorization: Optional[str] = Header(default=None)) -> tuple[dict, dict]:
        await ensure_indexes()
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Client authentication required.")
        token = authorization.split(" ", 1)[1].strip()
        if not token:
            raise HTTPException(status_code=401, detail="Client authentication required.")
        session = await db.client_sessions.find_one({"token_hash": hash_token(token)}, {"_id": 0})
        if not session:
            raise HTTPException(status_code=401, detail="Client session has expired. Please log in again.")
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if not expires_at or expires_at <= datetime.now(timezone.utc):
            await db.client_sessions.delete_one({"token_hash": hash_token(token)})
            raise HTTPException(status_code=401, detail="Client session has expired. Please log in again.")
        user = await db.client_users.find_one({"id": session["client_user_id"]}, {"_id": 0, "password_hash": 0, "password_salt": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Client account is unavailable.")
        return session, user

    @router.post("/signup")
    async def signup(input: ClientSignup):
        await ensure_indexes()
        email = normalize_email(input.email)
        name = input.name.strip()
        phone = input.phone.strip()
        if len(name) < 2 or len(phone) < 7:
            raise HTTPException(status_code=400, detail="Add your name and mobile number to create your account.")
        salt, derived = password_hash(input.password)
        now = datetime.now(timezone.utc)
        client_key = f"qfz_user_{uuid.uuid4().hex}"
        user = {
            "id": str(uuid.uuid4()),
            "client_key": client_key,
            "name": name,
            "phone": phone,
            "email_normalized": email,
            "password_salt": salt,
            "password_hash": derived,
            "created_at": now,
            "updated_at": now,
        }
        try:
            await db.client_users.insert_one(user.copy())
        except DuplicateKeyError as exc:
            raise HTTPException(status_code=409, detail="An account already exists with that email. Log in instead.") from exc
        await db.client_profiles.update_one(
            {"client_key": client_key},
            {"$set": {
                "client_key": client_key,
                "name": name,
                "phone": phone,
                "email": email,
                "account_user_id": user["id"],
                "updated_at": now.isoformat(),
            }, "$setOnInsert": {"created_at": now.isoformat(), "notes": "", "tags": [], "blocked": False}},
            upsert=True,
        )
        return await create_session(user)

    @router.post("/login")
    async def login(input: ClientLogin):
        await ensure_indexes()
        email = normalize_email(input.email)
        user = await db.client_users.find_one({"email_normalized": email}, {"_id": 0})
        if not user or not verify_password(input.password, user.get("password_salt", ""), user.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Email or password is incorrect.")
        await db.client_profiles.update_one(
            {"client_key": user["client_key"]},
            {"$set": {
                "client_key": user["client_key"],
                "name": user.get("name") or "",
                "phone": user.get("phone") or "",
                "email": user.get("email_normalized") or "",
                "account_user_id": user["id"],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True,
        )
        return await create_session(user)

    @router.get("/me")
    async def me(authorization: Optional[str] = Header(default=None)):
        _, user = await require_client(authorization)
        return {
            "client_key": user["client_key"],
            "profile": {
                "id": user["id"],
                "client_key": user["client_key"],
                "name": user.get("name") or "",
                "phone": user.get("phone") or "",
                "email": user.get("email_normalized") or "",
            },
        }

    @router.post("/change-password")
    async def change_password(input: ClientPasswordChange, authorization: Optional[str] = Header(default=None)):
        session, _ = await require_client(authorization)
        user = await db.client_users.find_one({"id": session["client_user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Client account is unavailable.")
        if not verify_password(input.current_password, user.get("password_salt", ""), user.get("password_hash", "")):
            raise HTTPException(status_code=400, detail="Your current password is incorrect.")
        if hmac.compare_digest(input.current_password, input.new_password):
            raise HTTPException(status_code=400, detail="Choose a new password that is different from your current password.")
        salt, derived = password_hash(input.new_password)
        now = datetime.now(timezone.utc)
        result = await db.client_users.update_one(
            {"id": user["id"]},
            {"$set": {"password_salt": salt, "password_hash": derived, "updated_at": now}},
        )
        if result.matched_count != 1:
            raise HTTPException(status_code=409, detail="Your password could not be updated. Please try again.")
        current_token = authorization.split(" ", 1)[1].strip()
        await db.client_sessions.delete_many({
            "client_user_id": user["id"],
            "token_hash": {"$ne": hash_token(current_token)},
        })
        return {"changed": True}

    @router.post("/logout")
    async def logout(authorization: Optional[str] = Header(default=None)):
        if authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
            if token:
                await db.client_sessions.delete_one({"token_hash": hash_token(token)})
        return {"logged_out": True}

    return router
