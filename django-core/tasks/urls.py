from django.urls import path
from .views import (
    TaskAssignView,
    TaskCompleteView,
    TaskCreateView,
    TaskDeleteView,
    TaskDescriptionEnhanceView,
    TaskListView,
    TaskDetailView,
    TaskPrioritySuggestView,
    TaskStartView,
    TaskUpdateView,
)

urlpatterns = [
    path("tasks/", TaskListView.as_view()),
    path("tasks/create/", TaskCreateView.as_view()),
    path("tasks/<int:pk>/", TaskDetailView.as_view()),
    path("tasks/<int:pk>/edit/", TaskUpdateView.as_view()),

    path("tasks/<int:pk>/assign/", TaskAssignView.as_view()),
    path("tasks/<int:pk>/start/", TaskStartView.as_view()),
    path("tasks/<int:pk>/complete/", TaskCompleteView.as_view()),
    path("tasks/<int:pk>/delete/", TaskDeleteView.as_view()),
    path("tasks/suggest-priority/", TaskPrioritySuggestView.as_view()),

      path(
        "tasks/enhance-description/",
        TaskDescriptionEnhanceView.as_view()
    ),


]

