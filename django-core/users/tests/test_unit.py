from django.test import SimpleTestCase
from django.contrib.auth import get_user_model
from users.views import generate_password_reset_token
import jwt
from django.conf import settings

User = get_user_model()

class PasswordResetTokenUnitTest(SimpleTestCase):
    """
    UNIT TEST
    =========
    Purpose:
    - Test pure business logic in isolation
    - No database
    - No HTTP request
    - No Django test client

    What we are testing:
    - generate_password_reset_token() creates a valid JWT
    - Token contains correct user_id
    - Token type is 'password_reset'
    """

    def test_generate_password_reset_token_contains_expected_payload(self):
        # Arrange: create a lightweight user object (not saved to DB)
        user = User(id=1, email="unit@test.com")

        # Act: generate reset token
        token = generate_password_reset_token(user)

        # Assert: decode token and verify payload
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        self.assertEqual(payload["user_id"], 1)
        self.assertEqual(payload["type"], "password_reset")
