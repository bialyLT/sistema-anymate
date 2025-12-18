from django.urls import path
from .views import RegisterView, UserProfileView, AdminCreateEmployeeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('admin/create-admin-employee/', AdminCreateEmployeeView.as_view(), name='admin_create_admin_employee'),
]

