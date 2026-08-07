"""Tests for /health probe endpoint and /api routes."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://quincy-barbershop.preview.emergentagent.com').rstrip('/')
LOCAL_URL = "http://localhost:8001"


class TestHealth:
    def test_health_local(self):
        r = requests.get(f"{LOCAL_URL}/health", timeout=10)
        assert r.status_code == 200
        assert r.json() == {"status": "healthy"}

    def test_health_external_reachable(self):
        # Ingress routes non-/api paths to frontend; K8s probes hit backend pod
        # directly on port 8001, so external status here is informational only.
        r = requests.get(f"{BASE_URL}/health", timeout=15)
        assert r.status_code == 200


class TestApi:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        assert r.json() == {"message": "Hello World"}

    def test_get_status(self):
        r = requests.get(f"{BASE_URL}/api/status", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_post_status(self):
        r = requests.post(f"{BASE_URL}/api/status", json={"client_name": "deploy_test"}, timeout=15)
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
        # Should have CORS header
        assert "access-control-allow-origin" in {k.lower() for k in r.headers.keys()}
