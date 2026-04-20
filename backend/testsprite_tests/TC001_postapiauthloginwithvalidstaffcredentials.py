import requests

def test_post_api_auth_login_with_valid_staff_credentials():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/auth/login"
    payload = {
        "username": "admin@university.edu.pk",
        "password": "Admin@123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
    try:
        json_response = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    token = json_response.get("token") or json_response.get("accessToken") or json_response.get("jwt")
    assert token and isinstance(token, str) and len(token) > 0, "JWT token not found or invalid in response"

test_post_api_auth_login_with_valid_staff_credentials()
