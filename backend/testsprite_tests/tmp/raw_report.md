
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** backend
- **Date:** 2026-04-18
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 postapiauthloginwithvalidstaffcredentials
- **Test Code:** [TC001_postapiauthloginwithvalidstaffcredentials.py](./TC001_postapiauthloginwithvalidstaffcredentials.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 27, in <module>
  File "<string>", line 18, in test_post_api_auth_login_with_valid_staff_credentials
AssertionError: Expected status 200 but got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/57042e87-4238-467d-b77e-8726574c0e0c/1c0db66a-c4e0-48f9-b5f6-3ccc0b283dbe
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 postapiauthstudentloginwithvalidstudentcredentials
- **Test Code:** [TC002_postapiauthstudentloginwithvalidstudentcredentials.py](./TC002_postapiauthstudentloginwithvalidstudentcredentials.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 23, in <module>
  File "<string>", line 15, in test_postapiauthstudentloginwithvalidstudentcredentials
AssertionError: Expected status code 200, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/57042e87-4238-467d-b77e-8726574c0e0c/72939401-6fb7-4bc8-8d94-096a1c29c2a4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 postapiauthchangepasswordwithvalidcurrentandnewpassword
- **Test Code:** [TC003_postapiauthchangepasswordwithvalidcurrentandnewpassword.py](./TC003_postapiauthchangepasswordwithvalidcurrentandnewpassword.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 20, in test_postapiauthchangepasswordwithvalidcurrentandnewpassword
  File "/var/lang/lib/python3.12/site-packages/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 500 Server Error: Internal Server Error for url: http://localhost:5000/api/auth/login

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 63, in <module>
  File "<string>", line 22, in test_postapiauthchangepasswordwithvalidcurrentandnewpassword
AssertionError: Login request failed: 500 Server Error: Internal Server Error for url: http://localhost:5000/api/auth/login

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/57042e87-4238-467d-b77e-8726574c0e0c/f0618038-c328-468c-97fd-06f8cfcd425d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 postapiauthforgotpasswordwithregisteredemail
- **Test Code:** [TC004_postapiauthforgotpasswordwithregisteredemail.py](./TC004_postapiauthforgotpasswordwithregisteredemail.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 37, in <module>
  File "<string>", line 22, in test_postapiauthforgotpasswordwithregisteredemail
AssertionError: Expected status code 200 but got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/57042e87-4238-467d-b77e-8726574c0e0c/70b18423-354d-466d-9cda-6ab61a30eec4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 getapiauthmewithauthorizationtoken
- **Test Code:** [TC005_getapiauthmewithauthorizationtoken.py](./TC005_getapiauthmewithauthorizationtoken.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 35, in <module>
  File "<string>", line 18, in test_get_api_auth_me_with_authorization_token
AssertionError: Login failed with status 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/57042e87-4238-467d-b77e-8726574c0e0c/7fa737b4-06c3-4090-9dc7-ae6112ec823e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 getapistudentswithadmintokenreturnsstudentlist
- **Test Code:** [TC006_getapistudentswithadmintokenreturnsstudentlist.py](./TC006_getapistudentswithadmintokenreturnsstudentlist.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 17, in test_get_api_students_with_admin_token_returns_student_list
  File "/var/lang/lib/python3.12/site-packages/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 500 Server Error: Internal Server Error for url: http://localhost:5000/api/auth/login

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 44, in <module>
  File "<string>", line 21, in test_get_api_students_with_admin_token_returns_student_list
AssertionError: Admin login request failed: 500 Server Error: Internal Server Error for url: http://localhost:5000/api/auth/login

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/57042e87-4238-467d-b77e-8726574c0e0c/3817a790-bab5-4b10-b205-bd2a7be5605c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 getapiclearancerequestswithauthorizedtokenreturnsrequests
- **Test Code:** [TC007_getapiclearancerequestswithauthorizedtokenreturnsrequests.py](./TC007_getapiclearancerequestswithauthorizedtokenreturnsrequests.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 40, in <module>
  File "<string>", line 20, in test_get_api_clearance_requests_with_authorized_token_returns_requests
AssertionError: Login failed with status 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/57042e87-4238-467d-b77e-8726574c0e0c/204a5aa2-7e04-406a-9686-0f014eb68332
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---