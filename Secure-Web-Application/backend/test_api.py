import requests

base_url = 'http://localhost:5000/api'

print("--- Registering ---")
res = requests.post(f"{base_url}/auth/register", json={
    "username": "apitest1",
    "email": "apitest1@test.local",
    "password": "Password123!"
})
print("Register status:", res.status_code, res.json())

print("--- Logging in (by username) ---")
res = requests.post(f"{base_url}/auth/login", json={
    "username": "apitest1",
    "password": "Password123!"
})
print("Login status:", res.status_code, res.json())

print("--- Logging in (by email) ---")
res = requests.post(f"{base_url}/auth/login", json={
    "username": "apitest1@test.local",
    "password": "Password123!"
})
print("Login status:", res.status_code, res.json())
