from django.shortcuts import render
# users/views.py
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
User = get_user_model()



# Create your views here.


# 1️⃣ UI LOGIN PAGE (GET only)
def login_page(request):
    return render(request, "login.html")

def generate_jwt(user):
    payload = {
        "user_id": user.id,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=2),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


from django.db import IntegrityError

@csrf_exempt
def signup_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    if not email or not password:
        return JsonResponse(
            {"error": "Email and password are required"},
            status=400
        )
    
    if not first_name or not last_name:
        return JsonResponse(
        {"error": "First name and last name are required"},
        status=400
    )


    # ✅ Check email properly
    if User.objects.filter(email=email).exists():
        return JsonResponse(
            {"error": "Email already in use"},
            status=400
        )

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
    except IntegrityError:
        return JsonResponse(
            {"error": "Email already in use"},
            status=400
        )

    return JsonResponse(
        {"message": "Signup successful"},
        status=201
    )



@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    # ✅ SUPPORT BOTH JSON (API) AND FORM (HTML)
    if request.content_type == "application/json":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
    else:
        email = request.POST.get("email")
        password = request.POST.get("password")

    user = authenticate(username=email, password=password)

    if not user:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    token = generate_jwt(user)

    return JsonResponse({
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.first_name
        }
    })
    




class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        })



class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully"})





class UserListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        User = get_user_model()
        return User.objects.all()



class UserSearchView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.GET.get("q", "")
        users = User.objects.filter(email__icontains=q)[:10]

        return Response([
            {"id": u.id, "email": u.email}
            for u in users
        ])
    

from .tasks import send_reset_email

@csrf_exempt
def forgot_password_view(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid method"},
            status=405
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    email = data.get("email")

    if not email:
        return JsonResponse(
            {"error": "Email is required"},
            status=400
        )

    user = User.objects.filter(email=email).first()

    # IMPORTANT: do not reveal user existence
    if user:
        token = generate_password_reset_token(user)

        reset_link = (
            f"{settings.FRONTEND_BASE_URL}"
            f"/reset-password/?token={token}"
        )

        # async email via Celery
        send_reset_email.delay(user.email, reset_link)

    return JsonResponse(
        {
            "message": "If the account exists, reset instructions have been sent."
        },
        status=200
    )



@csrf_exempt
def reset_password_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    data = json.loads(request.body)
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return JsonResponse(
            {"error": "Token and new password are required"},
            status=400
        )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        if payload.get("type") != "password_reset":
            return JsonResponse({"error": "Invalid token"}, status=400)

        user = User.objects.get(id=payload["user_id"])

        user.set_password(new_password)
        user.save()

        return JsonResponse({
            "message": "Password reset successful"
        }, status=200)

    except jwt.ExpiredSignatureError:
        return JsonResponse(
            {"error": "Reset link has expired"},
            status=400
        )

    except (jwt.InvalidTokenError, User.DoesNotExist):
        return JsonResponse(
            {"error": "Invalid reset token"},
            status=400
        )



def generate_password_reset_token(user):
    payload = {
        "user_id": user.id,
        "type": "password_reset",
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")



def reset_password_page(request):
    return render(request, "reset_password.html")
