import requests

base_url = 'http://localhost:5000/api'

# Test 1: Register a new user
print("--- 1. Registering ---")
res = requests.post(f"{base_url}/auth/register", json={
    "username": "FrontendUser",
    "email": "frontend@user.local",
    "password": "Password123!"
})
print("Register status:", res.status_code, res.json())

# Test 2: Login with correct email (Case insensitive)
print("--- 2. Logging in with email (case mismatch) ---")
res = requests.post(f"{base_url}/auth/login", json={
    "username": "FRONTEND@user.local",
    "password": "Password123!"
})
print("Login status:", res.status_code, res.json())

# Test 3: Login with correct username (Case insensitive)
print("--- 3. Logging in with username (case mismatch) ---")
res = requests.post(f"{base_url}/auth/login", json={
    "username": "frontenduser",
    "password": "Password123!"
})
print("Login status:", res.status_code, res.json())

# Test 4: Wrong password
print("--- 4. Logging in with wrong password ---")
res = requests.post(f"{base_url}/auth/login", json={
    "username": "FrontendUser",
    "password": "WrongPassword123!"
})
print("Login status:", res.status_code, res.json())
