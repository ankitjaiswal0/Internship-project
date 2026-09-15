import pytest
import requests
import sqlite3

BASE_URL = "http://localhost:5000/api"

def test_sql_injection_login():
    """Test that SQL Injection payload in username does not bypass login."""
    payload = {
        "username": "admin' OR '1'='1",
        "password": "password"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid credentials" in response.json().get("error", "")

def test_xss_in_registration():
    """Test that XSS payloads are handled safely (stored as text)."""
    payload = {
        "username": "<script>alert('xss')</script>",
        "email": "xss@example.com",
        "password": "Password123"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    
    # Registration might fail due to strict validation or succeed but data is safely stored
    # We just want to ensure it doesn't crash and returns standard JSON
    assert response.status_code in [201, 400, 409]
    assert "error" in response.json() or "message" in response.json()

def test_rate_limiting():
    """Test that rate limiting works on login (limit is 10/min)."""
    payload = {
        "username": "testuser",
        "password": "wrongpassword"
    }
    
    # Fire 15 requests
    status_codes = []
    for _ in range(12):
        resp = requests.post(f"{BASE_URL}/auth/login", json=payload)
        status_codes.append(resp.status_code)
        
    assert 429 in status_codes, "Rate limiting (429) was not triggered"

def test_weak_password_registration():
    """Test that weak password is rejected."""
    payload = {
        "username": "weakuser",
        "email": "weak@example.com",
        "password": "123" # too short
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == 400
    assert "at least 8 characters" in response.json().get("error", "")

def test_unauthorized_admin_access():
    """Test that unauthenticated user cannot access admin APIs."""
    response = requests.get(f"{BASE_URL}/admin/users")
    assert response.status_code == 401 # Missing Authorization Header
