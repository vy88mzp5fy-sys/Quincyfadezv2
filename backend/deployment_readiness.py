import os

from fastapi import APIRouter


def _configured(name: str) -> bool:
    value = os.environ.get(name, "").strip()
    if not value:
        return False
    lowered = value.lower()
    return not any(marker in lowered for marker in ("replace_me", "localhost", "example"))


def build_deployment_readiness_router(db):
    router = APIRouter(prefix="/runtime", tags=["runtime"])

    @router.get("/ready")
    async def deployment_ready():
        database_ok = False
        try:
            await db.command("ping")
            database_ok = True
        except Exception:
            database_ok = False

        checks = {
            "database": database_ok,
            "mongo_configured": _configured("MONGO_URL"),
            "stripe_secret_configured": _configured("STRIPE_SECRET_KEY"),
            "stripe_publishable_configured": _configured("STRIPE_PUBLISHABLE_KEY"),
            "admin_access_configured": _configured("ADMIN_PIN_SHA256"),
            "cron_configured": _configured("CRON_SECRET"),
        }
        return {
            "service": "quincyfadez-api",
            "ready": all(checks.values()),
            "checks": checks,
        }

    return router
