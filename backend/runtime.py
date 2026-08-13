"""QuincyFadez production API runtime.

Deploy this module as ``runtime:app``. It reuses the complete API assembled in
``app.py`` and adds the background notification worker without coupling push
delivery to booking/payment request handlers.
"""

import asyncio
from contextlib import suppress

from app import app, db
from notification_worker import notification_worker

_notification_worker_task = None


@app.on_event("startup")
async def start_notification_automation_worker():
    global _notification_worker_task
    await db.notification_events.create_index("event_key", unique=True)
    if _notification_worker_task is None or _notification_worker_task.done():
        _notification_worker_task = asyncio.create_task(
            notification_worker(db),
            name="quincyfadez-notification-worker",
        )


@app.on_event("shutdown")
async def stop_notification_automation_worker():
    global _notification_worker_task
    if _notification_worker_task is None:
        return
    _notification_worker_task.cancel()
    with suppress(asyncio.CancelledError):
        await _notification_worker_task
    _notification_worker_task = None
