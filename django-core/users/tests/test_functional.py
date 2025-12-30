from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginFunctionalTest(APITestCase):
    """
    FUNCTIONAL / API TEST
    =====================
    Purpose:
    - Validate login flow end-to-end via API
    - Simulates real client behavior

    Note:
    - login_view returns Django JsonResponse (not DRF Response)
    """

    def test_login_returns_jwt_token(self):
        # Arrange: create user in test DB
        User.objects.create_user(
            username="login@test.com",
            email="login@test.com",
            password="TestPass123",
            first_name="Login"
        )

        # Act: call login API
        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "login@test.com",
                "password": "TestPass123"
            },
            format="json"
        )

        # Assert: HTTP status
        self.assertEqual(response.status_code, 200)

        # Parse JSON response (JsonResponse)
        data = response.json()

        # Assert: JWT token exists
        self.assertIn("access_token", data)

        # Assert: user payload
        self.assertEqual(
            data["user"]["email"],
            "login@test.com"
        )
