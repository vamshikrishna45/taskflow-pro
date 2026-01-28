from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from pathlib import Path



# Fix BASE_DIR definition (must be at the top if used)
BASE_DIR = Path(__file__).resolve().parent.parent

# Your existing views (keep if you use them, but we'll use TemplateView for simplicity)
# from users.views import login_page

urlpatterns = [
    path("admin/", admin.site.urls),

    # # Public pages - standalone full HTML pages
    # path("", TemplateView.as_view(template_name="login.html")),
    # path("login/", TemplateView.as_view(template_name="login.html")),
    # path("signup/", TemplateView.as_view(template_name="signup.html")),
    # path("forgot-password/", TemplateView.as_view(template_name="forgot-password.html")),

    # # Authenticated area - all use the same layout (index.html) with navbar
    # path("dashboard/", TemplateView.as_view(template_name="dashboard.html")),
    # path("tasks/", TemplateView.as_view(template_name="tasks.html")),
    # path("task-detail/", TemplateView.as_view(template_name="task-detail.html")),  # ✅ ADD THIS
    # path("notifications/", TemplateView.as_view(template_name="notifications.html")),
    # path("profile/", TemplateView.as_view(template_name="profile.html")),
  


  

    # Your app APIs
    path("api/", include("tasks.urls")),
    path("api/", include("notifications.urls")),
    path("api/", include("users.urls")),
    path("api/", include("common.urls")),
    path("health/", lambda r: HttpResponse("ok")),
    path("metrics/", include("django_prometheus.urls")),


]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)