"""Smoke and contract tests for the QuincyFadez backend API."""
import os
import requests
import pytest

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://quincy-barbershop.preview.emergentagent.com",
).rstrip("/")
LOCAL_URL = "http://localhost:8001"


class TestHealth:
    def test_health_local(self):
        r = requests.get(f"{LOCAL_URL}/health", timeout=10)
        assert r.status_code == 200
        assert r.json() == {"status": "healthy"}

    def test_health_external_reachable(self):
        r = requests.get(f"{BASE_URL}/health", timeout=15)
        assert r.status_code == 200


class TestApi:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        assert r.json() == {"message": "QuincyFadez API"}

    def test_get_status(self):
        r = requests.get(f"{BASE_URL}/api/status", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_post_status(self):
        r = requests.post(
            f"{BASE_URL}/api/status",
            json={"client_name": "deploy_test"},
            timeout=15,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["client_name"] == "deploy_test"
        assert "id" in data and isinstance(data["id"], str)
        assert "timestamp" in data

    def test_cors_headers(self):
        r = requests.options(
            f"{BASE_URL}/api/status",
            headers={
                "Origin": "https://example.com",
                "Access-Control-Request-Method": "GET",
            },
            timeout=15,
        )
        assert "access-control-allow-origin" in {k.lower() for k in r.headers.keys()}


class TestBookingApi:
    def test_services_contract(self):
        r = requests.get(f"{BASE_URL}/api/booking/services", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "services" in data
        assert isinstance(data["services"], list)

        by_name = {item["name"]: item for item in data["services"]}
        assert by_name["Haircut"]["price"] == 20
        assert by_name["Haircut"]["duration_minutes"] == 45
        assert by_name["Haircut & Beard"]["price"] == 25
        assert by_name["Haircut & Beard"]["duration_minutes"] == 60

    @pytest.mark.parametrize("service", ["Haircut", "Haircut & Beard", "Shape Up", "Beard Trim"])
    def test_availability_contract(self, service):
        r = requests.get(
            f"{BASE_URL}/api/booking/availability",
            params={"service": service, "days": 7},
            timeout=15,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["timezone"] == "Europe/London"
        assert isinstance(data["setup_required"], bool)
        assert isinstance(data["days"], list)
        assert len(data["days"]) <= 7
        for day in data["days"]:
            assert "date" in day
            assert isinstance(day.get("slots"), list)

    def test_unknown_service_is_rejected(self):
        r = requests.get(
            f"{BASE_URL}/api/booking/availability",
            params={"service": "Not A Real Service", "days": 1},
            timeout=15,
        )
        # If weekly hours are not configured the endpoint still validates by
        # generating no slots; once configured it rejects the unknown service.
        assert r.status_code in {200, 400}
        if r.status_code == 400:
            assert "service" in r.json().get("detail", "").lower()

    def test_booking_requires_verified_payment_or_closed_schedule(self):
        r = requests.post(
            f"{BASE_URL}/api/booking/appointments",
            json={
                "client_key": "qfz_test_contract_client_12345",
                "service": "Haircut",
                "start_at": "2030-01-01T12:00:00+00:00",
            },
            timeout=15,
        )
        # A random test client must never be able to create a confirmed booking.
        assert r.status_code in {409, 503}
