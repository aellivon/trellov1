from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.generic.base import TemplateView

from django.views.generic.base import TemplateView
from rest_framework_jwt.views import obtain_jwt_token



urlpatterns = [
    path('', include('users.urls')),
    path('', include('boards.urls')),
    path('', include('activities.urls')),
    path('admin/', admin.site.urls),
    path('api/login/', obtain_jwt_token),
    re_path('^(.*)$', TemplateView.as_view(template_name='base.html'), name='fe')
] 


