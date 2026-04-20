import requests

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
CHANGE_PASSWORD_URL = f"{BASE_URL}/api/auth/change-password"
TIMEOUT = 30

USERNAME = "admin@university.edu.pk"
PASSWORD = "Admin@123"
NEW_PASSWORD = "Admin@1234"

def test_postapiauthchangepasswordwithvalidcurrentandnewpassword():
    # Login to get JWT token
    login_payload = {
        "username": USERNAME,
        "password": PASSWORD
    }
    try:
        login_response = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        login_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    login_data = login_response.json()
    token = login_data.get("token")
    assert token is not None and isinstance(token, str) and len(token) > 0, "Token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    change_password_payload = {
        "currentPassword": PASSWORD,
        "newPassword": NEW_PASSWORD
    }

    # Change password
    try:
        response = requests.post(CHANGE_PASSWORD_URL, json=change_password_payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Change password request failed: {e}"

    assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
    resp_json = response.json()
    # Check for confirmation in some key or message
    confirm_keys = ["message", "status", "detail", "success"]
    assert any(k in resp_json for k in confirm_keys) or any("password" in str(v).lower() or "success" in str(v).lower() or "changed" in str(v).lower() for v in resp_json.values()), "Response does not confirm password change"

    # Revert password back to original to avoid side effects
    revert_payload = {
        "currentPassword": NEW_PASSWORD,
        "newPassword": PASSWORD
    }
    try:
        revert_response = requests.post(CHANGE_PASSWORD_URL, json=revert_payload, headers=headers, timeout=TIMEOUT)
        revert_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Reverting password failed: {e}"

    assert revert_response.status_code == 200, f"Expected revert status 200 but got {revert_response.status_code}"

test_postapiauthchangepasswordwithvalidcurrentandnewpassword()
