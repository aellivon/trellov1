from .views import BoardViews, BoardMemberViews, BoardActivityWithPermissions
from django.urls import path

boards =  BoardViews.as_view({
    'post': 'create_board',
    'get': 'list_of_boards'
})

board_detail =  BoardActivityWithPermissions.as_view({
    'get': 'list_of_board_detail',
    'post': 'update_board_status',
    'patch': 'update_board_name',
})


#  Will combine when it's time for member end points
invite_member = BoardMemberViews.as_view({
    'post': 'invite_member'
})

remove_member = BoardMemberViews.as_view({
    'post': 'remove_member'
})

remove_members = BoardMemberViews.as_view({
    'post': 'remove_members'
})

display_user_validation = BoardMemberViews.as_view({
    'get': 'display_user_validation'
})


app_name = 'boards'

urlpatterns = [
    path('api/boards/', boards, name='boards'),
    path('api/boards/<int:board_id>/', board_detail, name='board_detail'),
    # Member End Points
    path('invite_member/', invite_member, name='invite_member'),
    path('remove_member/', remove_member, name='remove_member'),
    path('remove_members/', remove_members, name='remove_members'),
    path('validate/<str:token>/',display_user_validation,name="user_validation"),
]
