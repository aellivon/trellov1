from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from users.models import User
from django.contrib.auth import login
from .serializers import RegisterSerializer

from rest_framework.permissions import IsAuthenticated, AllowAny

class UserViews(ViewSet):
    """User Views"""

    def sign_up(self, *args, **kwargs):
        user = RegisterSerializer(data=self.request.data)
        if user.is_valid():
            user.create()
            return Response(user.data,status=201)
        return Response(user.errors, status=400)

