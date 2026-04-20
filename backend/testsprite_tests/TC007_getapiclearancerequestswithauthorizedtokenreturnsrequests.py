import requests

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
CLEARANCE_REQUESTS_URL = f"{BASE_URL}/api/clearance/requests"
TIMEOUT = 30
ADMIN_CREDENTIALS = {
    "username": "admin@university.edu.pk",
    "password": "Admin@123"
}

def test_get_api_clearance_requests_with_authorized_token_returns_requests():
    try:
        # Step 1: Login to get token
        login_response = requests.post(
            LOGIN_URL,
            json=ADMIN_CREDENTIALS,
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_data = login_response.json()
        token = login_data.get("token") or login_data.get("accessToken")  # handle possible keys
        assert token, "Token not found in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }
        # Step 2: Get clearance requests
        clearance_response = requests.get(
            CLEARANCE_REQUESTS_URL,
            headers=headers,
            timeout=TIMEOUT
        )
        assert clearance_response.status_code == 200, f"Expected 200, got {clearance_response.status_code}"
        clearance_data = clearance_response.json()
        assert isinstance(clearance_data, list), "Response data is not a list"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_clearance_requests_with_authorized_token_returns_requests()