from .views import (
    HomeViewSet, ColumnViewSet, CardViewSet, ColumnDetailViewSet, SpecificBoardViewSet, 
    SpecificCardViewSet, BoardMemberViewSet, UserValidationViewSet, SpecificCardMember,
    CardComments)
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

card_actions = CardViewSet.as_view({
    'get': 'list_of_cards_in_a_column',
    'post': 'create_card',
})

specific_card_actions = SpecificCardViewSet.as_view({
    'patch': 'update_card'
})


specific_card_member_actions = SpecificCardMember.as_view({
    'get': 'list_of_card_member',
    'post': 'assign_card_member',
    'patch': 'remove_card_member'
})


card_comment_actions = CardComments.as_view({
    'get': 'list_of_comment_in_a_card',
    'post': 'add_comment',
    'patch': 'remove_comment'
})

display_user_validation = UserValidationViewSet.as_view({
    'post': 'display_user_validation'
})


app_name = 'boards'

urlpatterns = [
    path('api/boards/', boards, name='boards'),
    path('api/boards/<int:board_id>/', board_detail, name='board_detail'),
    path('api/boards/<int:board_id>/members/', member_actions, name='member_actions'),
    path('api/boards/<int:board_id>/columns/', column_actions, name="column_actions"),
    path('api/boards/<int:board_id>/columns/<int:column_id>/', column_detail, name="column_detail"),
    path('api/boards/<int:board_id>/columns/<int:column_id>/cards/', card_actions, name="cards"),
    path('api/boards/<int:board_id>/columns/<int:column_id>/cards/<int:card_id>/',
        specific_card_actions, name="specific_card"),
    path('api/boards/<int:board_id>/columns/<int:column_id>/cards/<int:card_id>/members',
        specific_card_member_actions, name="card_member"),
    path('api/boards/<int:board_id>/columns/<int:column_id>/cards/<int:card_id>/comments',
        card_comment_actions, name="card_comments"),
    # WIP
    path('api/boards/validate/<str:token>/',display_user_validation,name="user_validation"),
]
