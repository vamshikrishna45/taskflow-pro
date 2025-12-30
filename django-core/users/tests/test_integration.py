
from django.test import TestCase
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class SignupIntegrationTest(TestCase):
    """
    INTEGRATION TEST
    ================
    Purpose:
    - Verify multiple Django components work together:
        * URL routing
        * View logic
        * Database ORM
        * JSON response

    What we are testing:
    - Signup API accepts valid input
    - User is created in the database
    - Correct success response is returned

    What we are NOT testing:
    - Password strength rules (unit tests handle that)
    - UI behavior (covered by UI tests)
    """

    def test_signup_creates_user_and_returns_201(self):
        # Arrange: valid signup payload
        payload = {
            "email": "integration@test.com",
            "password": "StrongPass123",
            "first_name": "Integration",
            "last_name": "User"
        }

        # Act: send POST request to signup endpoint
        response = self.client.post(
          "/api/auth/signup/",
            data=json.dumps(payload),
            content_type="application/json"
        )

        # Assert: HTTP response
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.json()["message"],
            "Signup successful"
        )

        # Assert: database state
        self.assertTrue(
            User.objects.filter(email="integration@test.com").exists()
        )
