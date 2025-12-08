from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Path for apps will go here, e.g. path('api/feed/', include('feed.urls'))
]
