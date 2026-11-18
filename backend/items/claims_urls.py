from django.urls import path
from .views import (
    ClaimListCreateView,
    ClaimDetailView,
)

urlpatterns = [
    path('', ClaimListCreateView.as_view(), name='claim_list_create'),
    path('<int:pk>/', ClaimDetailView.as_view(), name='claim_detail'),
]
