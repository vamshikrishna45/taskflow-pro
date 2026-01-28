# users/urls.py
from django.urls import path
from .views import EmailTokenObtainPairView, SignupAPIView, UserListView, UserSearchView, reset_password_view, forgot_password_view, ProfileView, ChangePasswordView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 🔐 AUTH
    path("v1/auth/signup/", SignupAPIView.as_view()),
path("v1/auth/login/", EmailTokenObtainPairView.as_view()),    
path("v1/auth/refresh/", TokenRefreshView.as_view()),

    path("v1/auth/forgot-password/", forgot_password_view),
    path("v1/auth/reset-password/", reset_password_view),

    # 👤 USER
    path("v1/profile/", ProfileView.as_view()),
    path("v1/profile/change-password/", ChangePasswordView.as_view()),

    # 🔍 USERS
    path("v1/users/", UserListView.as_view()),
    path("v1/users/search/", UserSearchView.as_view()),
]


