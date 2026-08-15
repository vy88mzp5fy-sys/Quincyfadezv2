"""QuincyFadez API entrypoint with client authentication, notifications and waiting list enabled.

Deploy this module as ``app:app``. It keeps the existing booking/admin API intact,
mounts the client account router at /api/client, exposes authenticated push-device
registration at /api/notifications, and serves the client waiting list at /api/waiting-list.
"""

from admin_insights_v2_api import build_admin_insights_v2_router
from client_auth import build_client_auth_router
from notification_api import build_notification_router
from waiting_list_api import build_waiting_list_router
from server import LONDON, SERVICES, app, db

app.include_router(build_client_auth_router(db), prefix="/api")
app.include_router(build_notification_router(db), prefix="/api")
app.include_router(build_waiting_list_router(db, SERVICES), prefix="/api")
app.include_router(build_admin_insights_v2_router(db, LONDON), prefix="/api")


@app.on_event("startup")
async def client_auth_indexes():
    await db.client_accounts.create_index("email", unique=True)
    await db.client_accounts.create_index("client_key", unique=True)
    await db.client_sessions.create_index("token_hash", unique=True)
    await db.client_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.push_devices.create_index("expo_push_token", unique=True)
    await db.push_devices.create_index("client_key")
    await db.client_notification_preferences.create_index("client_key", unique=True)
    await db.waiting_list.create_index([("client_key", 1), ("status", 1)])
    await db.waiting_list.create_index([("service", 1), ("status", 1), ("created_at", 1)])
