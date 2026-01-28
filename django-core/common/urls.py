from django.urls import path
from .views import dashboard_summary_api
from django.views.generic import TemplateView


urlpatterns = [
path("v1/dashboard/summary/", dashboard_summary_api),


    
]
