import requests

def test_postapiauthstudentloginwithvalidstudentcredentials():
    base_url = "http://localhost:5000"
    login_url = f"{base_url}/api/auth/student/login"
    payload = {
        "username": "student1@university.edu.pk",
        "password": "Student@123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(login_url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        json_response = response.json()
        assert "token" in json_response, "JWT token not found in response"
        token = json_response.get("token")
        assert isinstance(token, str) and len(token) > 0, "Invalid JWT token received"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_postapiauthstudentloginwithvalidstudentcredentials()