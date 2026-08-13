"""QuincyFadez Vercel deployment entrypoint.

This wrapper keeps the secured production runtime unchanged and mounts only
non-sensitive deployment diagnostics on top of it.
"""

from deployment_readiness import build_deployment_readiness_router
from runtime import app, db

app.include_router(build_deployment_readiness_router(db), prefix="/api")
