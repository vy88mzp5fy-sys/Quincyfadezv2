"""QuincyFadez production API runtime.

Deploy this module as ``runtime:app``. It reuses the complete API assembled in
``app.py`` and exposes a protected scheduled notification cycle for Vercel Cron.
Immediate booking/payment requests remain independent from notification delivery.
"""

from datetime import datetime, timezone
from typing import Optional
import os

from fastapi import Header, HTTPException

from app import app, db
from notification_worker import process_notification_cycle


@app.on_event("startup")
async def notification_event_index():
    await db.notification_events.create_index("event_key", unique=True)


@app.get("/api/notifications/cron")
async def run_notification_cron(authorization: Optional[str] = Header(default=None)):
    cron_secret = os.environ.get("CRON_SECRET", "").strip()
    if not cron_secret or authorization != f"Bearer {cron_secret}":
        raise HTTPException(status_code=401, detail="Cron authentication required.")
    await process_notification_cycle(db)
    return {
        "processed": True,
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }
