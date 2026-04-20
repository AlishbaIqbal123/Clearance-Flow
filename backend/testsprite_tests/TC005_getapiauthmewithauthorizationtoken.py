import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = "/api/auth/login"
AUTH_ME_ENDPOINT = "/api/auth/me"
TIMEOUT = 30

def test_get_api_auth_me_with_authorization_token():
    login_url = BASE_URL + LOGIN_ENDPOINT
    auth_me_url = BASE_URL + AUTH_ME_ENDPOINT
    credentials = {
        "username": "admin@university.edu.pk ",
        "password": "Admin@123"
    }
    try:
        # Login to get JWT token
        login_resp = requests.post(login_url, json=credentials, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        token = login_json.get("token")
        assert token and isinstance(token, str), "JWT token not found in login response"
        
        # Use token to get current user profile
        headers = {"Authorization": f"Bearer {token}"}
        auth_me_resp = requests.get(auth_me_url, headers=headers, timeout=TIMEOUT)
        assert auth_me_resp.status_code == 200, f"Expected 200, got {auth_me_resp.status_code}"
        profile = auth_me_resp.json()
        # Validate profile contains at least username or email or id (assuming)
        assert isinstance(profile, dict), "Profile response is not a JSON object"
        keys_to_check = ["username", "email", "id"]
        assert any(key in profile for key in keys_to_check), "Profile missing expected user identification fields"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_auth_me_with_authorization_token()