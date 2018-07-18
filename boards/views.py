from django.shortcuts import get_object_or_404
from django.contrib.auth import login

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

from users.models import User

from .models import Board, BoardMember, Referral
from .serializers import( 
    ArchiveMember, ArchiveMembers, BoardNameSerializer, CreateBoardSerializer, GetJoinedBoards,
    InviteMemberSerializer, ReferralValidationSerializer, UpdateBoardStatusSerializer)


class BoardViews(ViewSet):
    """Board Views"""

    permission_classes = (IsAuthenticated,)

    def list_of_boards(self, *args, **kwargs):
        """
            get list of boards
        """
        board_member = BoardMember.active_objects.filter(
            user=self.request.user, board__is_active=True, is_confirmed=True)
        serializer = GetJoinedBoards(board_member, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def list_of_board_detail(self, *args, **kwargs):
        """
            display board details
        """
        board_id= self.kwargs.get('board_id')
        board= get_object_or_404(Board, is_active=True, id=board_id)
        serializer= BoardNameSerializer(board)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def create_board(self, *args, **kwargs):
        """
            creating board end point
        """
        serializer=CreateBoardSerializer(
            data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update_board_name(self, *args, **kwargs):
        """
            updating board name end point
        """
        board = get_object_or_404(Board,pk=self.request.data['id'])
        serializer=BoardNameSerializer(instance=board, data=self.request.data)
        if serializer.is_valid():
            success = serializer.save()
            if success:
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update_board_status(self, *args, **kwargs):
        """
            archiving a board end point
        """
        board = get_object_or_404(Board,pk=self.request.data['id'])
        serializer=UpdateBoardStatusSerializer(instance=board, data=self.request.data)
        if serializer.is_valid():
            success = serializer.save()
            if success:
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BoardMemberViews(ViewSet):
    """
        Board member views
    """

    permission_classes =(IsAuthenticated, )

    def invite_member(self, *args, **kwargs):
        """
            invite member
        """
        serializer=InviteMemberSerializer(data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def remove_member(self, *args, **kwargs):
        serializer=ArchiveMember(data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def remove_members(self, *args, **kwargs):
        serializer=ArchiveMembers(data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def display_user_validation(self, *args, **kwargs):
        # WIP
        token = self.kwargs.get('token')
        referral = get_object_or_404(Referral, token=token, is_active = True)
        serializer= ReferralValidationSerializer(referral)
        return Response(serializer.data, status=status.HTTP_200_OK)
       