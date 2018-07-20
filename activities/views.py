from django.shortcuts import render

from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status

from boards.permissions import BoardMemberPermission

from .models import Activity
from .serializers import AllActivitySerializer

class ActivityViewSet(ViewSet):
    """
        Specific Card Member View Set
    """
    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def list_of_all_activities(self, *args, **kwargs):
        """
            get list of boards
        """
        board_id = self.kwargs.get('board_id')
        activities = Activity.active_objects.filter(board__id=board_id).order_by('-modified')
        serializer = AllActivitySerializer(activities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
