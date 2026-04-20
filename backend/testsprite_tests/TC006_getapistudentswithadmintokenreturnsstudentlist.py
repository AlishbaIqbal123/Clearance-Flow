import requests

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
STUDENTS_URL = f"{BASE_URL}/api/students"
TIMEOUT = 30

ADMIN_CREDENTIALS = {
    "username": "admin@university.edu.pk",
    "password": "Admin@123"
}

def test_get_api_students_with_admin_token_returns_student_list():
    # Login as admin to get token
    try:
        login_resp = requests.post(LOGIN_URL, json=ADMIN_CREDENTIALS, timeout=TIMEOUT)
        login_resp.raise_for_status()
        token = login_resp.json().get("token")
        assert token, "No token received from login"
    except requests.RequestException as e:
        assert False, f"Admin login request failed: {e}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        resp = requests.get(STUDENTS_URL, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        assert resp.status_code == 200, f"Expected status code 200, got {resp.status_code}"

        data = resp.json()
        # Validate paginated response structure: expecting keys like 'items' or 'students', 'total', 'page', etc.
        # Since exact schema is not given, assert at least a list of students returned
        assert isinstance(data, dict), "Response JSON is not an object"
        students_list = data.get("items") or data.get("students") or data.get("data")
        assert students_list is not None, "Response JSON does not contain students list in expected keys"
        assert isinstance(students_list, list), "Students list is not a list"
    except requests.HTTPError as he:
        assert False, f"GET /api/students returned error: {he}"
    except requests.RequestException as e:
        assert False, f"GET /api/students request failed: {e}"

test_get_api_students_with_admin_token_returns_student_list()
