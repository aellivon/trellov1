from .views import (
    HomeViewSet, ColumnViewSet, ColumnDetailViewSet, SpecificBoardViewSet, 
    BoardMemberViewSet, UserValidationViewSet)
from django.urls import path

boards =  HomeViewSet.as_view({
    'post': 'create_board',
    'get': 'list_of_boards'
})

board_detail =  SpecificBoardViewSet.as_view({
    'get': 'list_of_board_detail',
    'post': 'update_board_status',
    'patch': 'update_board_name',
})


member_actions = BoardMemberViewSet.as_view({
    'get': 'list_of_members',
    'post': 'invite_member',
    'patch': 'remove_members'
})

column_actions = ColumnViewSet.as_view({
    'get': 'list_of_column_in_board',
    'post': 'create_column',
    'patch': 'update_column'
})

column_detail = ColumnDetailViewSet.as_view({
    'get': 'get_column_detail'
})

display_user_validation = UserValidationViewSet.as_view({
    'post': 'display_user_validation'
})


app_name = 'boards'

urlpatterns = [
    path('api/boards/', boards, name='boards'),
    path('api/boards/<int:board_id>/', board_detail, name='board_detail'),
    path('api/boards/<int:board_id>/member/', member_actions, name='member_actions'),
    path('api/boards/<int:board_id>/columns/', column_actions, name="column_actions"),
    path('api/boards/<int:board_id>/columns/<int:column_id>/', column_detail, name="column_detail"),
    # WIP
    path('api/boards/validate/<str:token>/',display_user_validation,name="user_validation"),
]
