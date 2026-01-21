# users/urls.py
from django.urls import path
from .views import UserListView, UserSearchView, reset_password_page, reset_password_view, signup_view, login_view, forgot_password_view, ProfileView, ChangePasswordView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 🔐 AUTH APIs (JSON)
    path("auth/login/", login_view, name="api-login"),
    path("auth/signup/", signup_view, name="api-signup"),
    path("auth/forgot-password/", forgot_password_view, name="api-forgot-password"),

    # 👤 PROTECTED APIs
    path("profile/", ProfileView.as_view()),
    path("profile/change-password/", ChangePasswordView.as_view()),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/search/", UserSearchView.as_view()),
    path("reset-password/", reset_password_page, name="reset-password"),
    path("auth/reset-password/", reset_password_view),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),


    
  



]
