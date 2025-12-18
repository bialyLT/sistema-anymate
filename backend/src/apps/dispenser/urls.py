from django.urls import path

from .views import (
    DispenserDetailView,
    DispenserListCreateView,
    SolicitudCreateView,
    SolicitudAcceptAdminView,
    SolicitudesSummaryAdminView,
)

urlpatterns = [
    path('dispensers/', DispenserListCreateView.as_view(), name='dispenser_list_create'),
    path('dispensers/<int:codigo_dispenser>/', DispenserDetailView.as_view(), name='dispenser_detail'),
    path('solicitudes/', SolicitudCreateView.as_view(), name='solicitud_create'),
    path('solicitudes/summary/', SolicitudesSummaryAdminView.as_view(), name='solicitudes_summary_admin'),
    path('solicitudes/accept/', SolicitudAcceptAdminView.as_view(), name='solicitud_accept_admin'),
]
