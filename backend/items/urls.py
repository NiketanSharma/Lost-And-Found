from django.urls import path
from .views import (
    ItemListCreateView,
    ItemDetailView,
    ItemResolveView,
)

urlpatterns = [
    path('', ItemListCreateView.as_view(), name='item_list_create'),
    path('<int:pk>/', ItemDetailView.as_view(), name='item_detail'),
    path('<int:pk>/resolve/', ItemResolveView.as_view(), name='item_resolve'),
]
