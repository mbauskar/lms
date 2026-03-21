from django.urls import path
from library.views import health_check

urlpatterns = [
    path('health/', health_check, name='health-check'),
]
