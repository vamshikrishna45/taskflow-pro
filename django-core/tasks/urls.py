from django.urls import path
from .views import (
    TaskListView,
    TaskCreateView,
    TaskDetailView,
    TaskUpdateView,
    TaskDeleteView,
    TaskAssignView,
    TaskStartView,
    TaskCompleteView,
    TaskPrioritySuggestView,
    TaskDescriptionEnhanceView,
)

urlpatterns = [
    # 📋 TASKS
    path("v1/tasks/", TaskListView.as_view()),          # GET
    path("v1/tasks/create/", TaskCreateView.as_view()), # POST

    # 🔍 TASK BY ID
    path("v1/tasks/<int:pk>/", TaskDetailView.as_view()),        # GET
    path("v1/tasks/<int:pk>/update/", TaskUpdateView.as_view()), # PATCH
    path("v1/tasks/<int:pk>/delete/", TaskDeleteView.as_view()), # DELETE

    # ⚙️ TASK ACTIONS
    path("v1/tasks/<int:pk>/assign/", TaskAssignView.as_view()),
    path("v1/tasks/<int:pk>/start/", TaskStartView.as_view()),
    path("v1/tasks/<int:pk>/complete/", TaskCompleteView.as_view()),

    # 🤖 AI HELPERS
    path("v1/tasks/suggest-priority/", TaskPrioritySuggestView.as_view()),
    path("v1/tasks/enhance-description/", TaskDescriptionEnhanceView.as_view()),
]
