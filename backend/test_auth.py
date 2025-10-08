"""Quick test script to verify authentication endpoints."""
import requests

BASE_URL = "http://localhost:8000/api"

# Test 1: Login
print("=" * 50)
print("TEST 1: Login")
print("=" * 50)

login_data = {
    "username": "testuser",  # Correct username from database
    "password": "Test1234"
}

response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    tokens = response.json()
    access_token = tokens["access_token"]
    
    # Test 2: Get current user
    print("\n" + "=" * 50)
    print("TEST 2: Get Current User")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {access_token}"}
    print(f"Sending request with headers: {headers}")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("\n✅ Authentication is working correctly!")
    else:
        print("\n❌ Failed to get current user")
else:
    print("\n❌ Login failed")
