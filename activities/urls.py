from django.urls import path

from .views import (ActivityViewSet, ActivityViewWithoutBoardMemberPermission)


activity_actions =  ActivityViewSet.as_view({
    'get': 'list_of_all_board_activities'
})

user_activity_actions = ActivityViewWithoutBoardMemberPermission.as_view({
    'get': 'list_of_all_user_activites'
})


app_name = 'activities'

urlpatterns = [
    path('api/boards/<int:board_id>/activities/', activity_actions, name='member_actions'),
    path('api/boards/user_activities/', user_activity_actions, name='user_actions'),
]

