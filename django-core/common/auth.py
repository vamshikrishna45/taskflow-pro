import jwt
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.models import User

def jwt_required(view_func):
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return JsonResponse({"error": "Authorization header missing"}, status=401)

        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload["user_id"])
            request.user = user
        except Exception:
            return JsonResponse({"error": "Invalid or expired token"}, status=401)

        return view_func(request, *args, **kwargs)
    return wrapper
