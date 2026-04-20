import requests

def test_postapiauthforgotpasswordwithregisteredemail():
    base_url = "http://localhost:5000"
    url = f"{base_url}/api/auth/forgot-password"
    timeout = 30

    # Use a known registered email for the test (assumed)
    payload = {
        "email": "admin@university.edu.pk"
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    # We expect some confirmation in the response body that reset token/email was sent
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check for confirmation message or presence of expected keys
    assert (
        "message" in resp_json and
        ("reset token was sent" in resp_json["message"].lower() or "email was sent" in resp_json["message"].lower())
    ) or (
        "success" in resp_json and resp_json["success"] is True
    ), f"Unexpected response content: {resp_json}"

test_postapiauthforgotpasswordwithregisteredemail()