from django.urls import path
from .views import dashboard_view
from django.views.generic import TemplateView


urlpatterns = [
    path("dashboard/", dashboard_view),


    
]
