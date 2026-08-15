from datetime import datetime, timezone, timedelta
from typing import Optional
import hashlib

from fastapi import APIRouter, Depends, Header, HTTPException, Query


def build_admin_insights_v2_router(db, london):
    router = APIRouter(prefix="/admin", tags=["admin-insights"])

    def hash_value(value: str) -> str:
        return hashlib.sha256(value.encode("utf-8")).hexdigest()

    async def require_admin(authorization: Optional[str] = Header(default=None)):
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Admin authentication required.")
        token = authorization.split(" ", 1)[1].strip()
        if not token:
            raise HTTPException(status_code=401, detail="Admin authentication required.")
        now = datetime.now(timezone.utc)
        session = await db.admin_sessions.find_one(
            {"token_hash": hash_value(token), "expires_at": {"$gt": now}},
            {"_id": 0},
        )
        if not session:
            raise HTTPException(status_code=401, detail="Admin session expired. Please sign in again.")
        return session

    def period_bounds(period: str, now_local: datetime):
        if period == "day":
            start = datetime.combine(now_local.date(), datetime.min.time(), tzinfo=london)
            end = start + timedelta(days=1)
            previous_end = start
            previous_start = previous_end - timedelta(days=1)
            return start, end, previous_start, previous_end
        if period == "month":
            start = datetime(now_local.year, now_local.month, 1, tzinfo=london)
            if now_local.month == 12:
                end = datetime(now_local.year + 1, 1, 1, tzinfo=london)
            else:
                end = datetime(now_local.year, now_local.month + 1, 1, tzinfo=london)
            if now_local.month == 1:
                previous_start = datetime(now_local.year - 1, 12, 1, tzinfo=london)
            else:
                previous_start = datetime(now_local.year, now_local.month - 1, 1, tzinfo=london)
            previous_end = start
            return start, end, previous_start, previous_end
        start_date = now_local.date() - timedelta(days=now_local.date().weekday())
        start = datetime.combine(start_date, datetime.min.time(), tzinfo=london)
        end = start + timedelta(days=7)
        previous_end = start
        previous_start = start - timedelta(days=7)
        return start, end, previous_start, previous_end

    async def load_bookings(start_local: datetime, end_local: datetime):
        start_utc = start_local.astimezone(timezone.utc).isoformat()
        end_utc = end_local.astimezone(timezone.utc).isoformat()
        rows = await db.bookings.find(
            {"start_at_utc": {"$gte": start_utc, "$lt": end_utc}},
            {"_id": 0, "stripe_payment_method_id": 0, "active_slot_key": 0},
        ).sort("start_at_utc", 1).to_list(5000)
        return rows, start_utc, end_utc

    async def new_client_count(active, start_utc: str, end_utc: str):
        keys = {b.get("client_key") for b in active if b.get("client_key")}
        total = 0
        for key in keys:
            first = await db.bookings.find_one(
                {"client_key": key, "status": {"$in": ["confirmed", "completed", "no_show"]}},
                {"_id": 0, "start_at_utc": 1},
                sort=[("start_at_utc", 1)],
            )
            if first and start_utc <= first.get("start_at_utc", "") < end_utc:
                total += 1
        return total

    async def repeat_client_stats(active, end_utc: str):
        keys = {b.get("client_key") for b in active if b.get("client_key")}
        if not keys:
            return 0, 0
        repeat = 0
        for key in keys:
            visits = await db.bookings.count_documents({
                "client_key": key,
                "status": {"$in": ["completed", "no_show"]},
                "start_at_utc": {"$lt": end_utc},
            })
            if visits >= 2:
                repeat += 1
        return repeat, round((repeat / len(keys)) * 100, 1)

    def pct_change(current: float, previous: float):
        if previous == 0:
            return None if current == 0 else 100.0
        return round(((current - previous) / previous) * 100, 1)

    def service_breakdown(completed):
        stats = {}
        for booking in completed:
            service = booking.get("service") or "Other"
            item = stats.setdefault(service, {"name": service, "bookings": 0, "revenue": 0.0})
            item["bookings"] += 1
            item["revenue"] += float(booking.get("price") or 0)
        return sorted(stats.values(), key=lambda item: (item["bookings"], item["revenue"]), reverse=True)

    def peak_hours(active):
        buckets = [
            (8, 10, "8:00 – 10:00"),
            (10, 12, "10:00 – 12:00"),
            (12, 14, "12:00 – 2:00"),
            (14, 16, "2:00 – 4:00"),
            (16, 18, "4:00 – 6:00"),
            (18, 20, "6:00 – 8:00"),
        ]
        result = []
        for start_hour, end_hour, label in buckets:
            count = 0
            for booking in active:
                raw = booking.get("start_at") or booking.get("start_at_utc")
                if not raw:
                    continue
                try:
                    dt = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=london)
                    hour = dt.astimezone(london).hour
                    if start_hour <= hour < end_hour:
                        count += 1
                except Exception:
                    continue
            result.append({"label": label, "bookings": count, "start_hour": start_hour})
        return sorted(result, key=lambda item: item["bookings"], reverse=True)[:3]

    def trend(rows, start_local: datetime, end_local: datetime):
        result = []
        current = start_local.date()
        end_date = end_local.date()
        while current < end_date:
            day_rows = [b for b in rows if str(b.get("start_at") or b.get("start_at_utc") or "")[:10] == current.isoformat()]
            completed = [b for b in day_rows if b.get("status") == "completed"]
            active = [b for b in day_rows if b.get("status") in {"confirmed", "completed", "no_show"}]
            result.append({
                "date": current.isoformat(),
                "revenue": round(sum(float(b.get("price") or 0) for b in completed), 2),
                "bookings": len(active),
                "completed": len(completed),
            })
            current += timedelta(days=1)
        return result

    async def summarise(rows, start_utc: str, end_utc: str):
        active = [b for b in rows if b.get("status") in {"confirmed", "completed", "no_show"}]
        completed = [b for b in rows if b.get("status") == "completed"]
        cancelled = [b for b in rows if b.get("status") == "cancelled"]
        no_shows = [b for b in rows if b.get("status") == "no_show"]
        revenue = round(sum(float(b.get("price") or 0) for b in completed), 2)
        average = round(revenue / len(completed), 2) if completed else 0
        new_clients = await new_client_count(active, start_utc, end_utc)
        repeat_clients, repeat_percent = await repeat_client_stats(active, end_utc)
        services = service_breakdown(completed)
        return {
            "active": active,
            "completed": completed,
            "revenue": revenue,
            "bookings": len(active),
            "completed_count": len(completed),
            "cancellations": len(cancelled),
            "no_shows": len(no_shows),
            "new_clients": new_clients,
            "average_booking_value": average,
            "repeat_clients": repeat_clients,
            "repeat_clients_percent": repeat_percent,
            "service_breakdown": services,
            "top_service": services[0]["name"] if services else None,
            "peak_hours": peak_hours(active),
        }

    @router.get("/insights-v2")
    async def admin_insights_v2(
        period: str = Query(default="week", pattern="^(day|week|month)$"),
        _=Depends(require_admin),
    ):
        now_local = datetime.now(london)
        start_local, end_local, previous_start_local, previous_end_local = period_bounds(period, now_local)
        rows, start_utc, end_utc = await load_bookings(start_local, end_local)
        previous_rows, previous_start_utc, previous_end_utc = await load_bookings(previous_start_local, previous_end_local)
        current = await summarise(rows, start_utc, end_utc)
        previous = await summarise(previous_rows, previous_start_utc, previous_end_utc)

        return {
            "period": period,
            "start_date": start_local.date().isoformat(),
            "end_date": (end_local.date() - timedelta(days=1)).isoformat(),
            "revenue": current["revenue"],
            "bookings": current["bookings"],
            "completed": current["completed_count"],
            "new_clients": current["new_clients"],
            "average_booking_value": current["average_booking_value"],
            "cancellations": current["cancellations"],
            "no_shows": current["no_shows"],
            "repeat_clients": current["repeat_clients"],
            "repeat_clients_percent": current["repeat_clients_percent"],
            "top_service": current["top_service"],
            "service_breakdown": current["service_breakdown"],
            "peak_hours": current["peak_hours"],
            "trend": trend(rows, start_local, end_local),
            "changes": {
                "revenue_percent": pct_change(current["revenue"], previous["revenue"]),
                "bookings_percent": pct_change(current["bookings"], previous["bookings"]),
                "new_clients_percent": pct_change(current["new_clients"], previous["new_clients"]),
                "average_booking_value_percent": pct_change(current["average_booking_value"], previous["average_booking_value"]),
                "repeat_clients_percent_points": round(current["repeat_clients_percent"] - previous["repeat_clients_percent"], 1),
                "no_shows_delta": current["no_shows"] - previous["no_shows"],
            },
            "previous": {
                "revenue": previous["revenue"],
                "bookings": previous["bookings"],
                "new_clients": previous["new_clients"],
                "average_booking_value": previous["average_booking_value"],
                "repeat_clients_percent": previous["repeat_clients_percent"],
                "no_shows": previous["no_shows"],
            },
        }

    return router
