from django.urls import path

from .views import (ActivityViewSet)


activity_actions =  ActivityViewSet.as_view({
    'get': 'list_of_all_activities'
})


app_name = 'activities'

urlpatterns = [
    path('api/boards/<int:board_id>/activities/', activity_actions, name='member_actions'),
]
