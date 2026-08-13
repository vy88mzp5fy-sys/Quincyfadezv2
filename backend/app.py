"""QuincyFadez API entrypoint with client authentication enabled.

Deploy this module as ``app:app``. It keeps the existing booking/admin API intact
and mounts the client account router at /api/client.
"""

from client_auth import build_client_auth_router
from server import app, db

app.include_router(build_client_auth_router(db), prefix="/api")
