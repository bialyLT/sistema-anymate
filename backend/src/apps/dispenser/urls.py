from django.urls import path

from .views import DispenserDetailView, DispenserListCreateView

urlpatterns = [
    path('dispensers/', DispenserListCreateView.as_view(), name='dispenser_list_create'),
    path('dispensers/<int:codigo_dispenser>/', DispenserDetailView.as_view(), name='dispenser_detail'),
]
