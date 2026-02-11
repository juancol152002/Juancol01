import requests

BASE_URL = "http://127.0.0.1:8000"

def test_registration():
    url = f"{BASE_URL}/api/users/registro/"
    payload = {
        "email": "testuser@example.com",
        "username": "testuser@example.com",
        "password": "Password123!",
        "first_name": "Test User"
    }
    print(f"Testing registration at {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_login():
    url = f"{BASE_URL}/api/token/"
    payload = {
        "username": "testuser@example.com",
        "password": "Password123!"
    }
    print(f"\nTesting login at {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_registration()
    test_login()
