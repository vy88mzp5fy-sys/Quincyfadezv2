"""QuincyFadez API entrypoint with client authentication and notifications enabled.

Deploy this module as ``app:app``. It keeps the existing booking/admin API intact,
mounts the client account router at /api/client, and exposes authenticated push-device
registration at /api/notifications.
"""

from client_auth import build_client_auth_router
from notification_api import build_notification_router
from server import app, db

app.include_router(build_client_auth_router(db), prefix="/api")
app.include_router(build_notification_router(db), prefix="/api")


@app.on_event("startup")
async def client_auth_indexes():
    await db.client_accounts.create_index("email", unique=True)
    await db.client_accounts.create_index("client_key", unique=True)
    await db.client_sessions.create_index("token_hash", unique=True)
    await db.client_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.push_devices.create_index("expo_push_token", unique=True)
    await db.push_devices.create_index("client_key")
