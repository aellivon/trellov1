from annoying.functions import get_object_or_None

from rest_framework import permissions

from .models import BoardMember


class BoardMemberPermission(permissions.BasePermission):
    """
        Permission for boards
    """

    def has_permission(self, request, view):
        board_id = request.resolver_match.kwargs.get('board_id')
        # Permission Denied if returns false
        board_member = get_object_or_None(
            BoardMember, board__id=board_id, user__pk=request.user.id,
            is_active=True)
        if board_member:
            return bool(board_member.is_confirmed)
        return bool(board_member)
