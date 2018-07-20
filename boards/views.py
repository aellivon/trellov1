from activities.constants import ACTIVITY_ACTION 

from django.shortcuts import get_object_or_404
from django.contrib.auth import login

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

from users.models import User

from .models import Board, BoardMember, Card, Column, Referral, CardMember, CardComment
from .mixins import GetBoardMixIn
from .permissions import BoardMemberPermission
from .serializers import( 
    ArchiveMembers, ArchiveColumnSerializer, BoardNameSerializer, CreateCardSerializer,CreateBoardSerializer, 
    GetJoinedBoards, ColumnSerializer, CreateColumnSerializer,ColumnDetailSerializer , ListOfMembers,
    ListCardSerializer, InviteMemberSerializer, ReferralValidationSerializer, UpdateBoardStatusSerializer,
    UpdateColumnNameSerializer, UpdatePositionSerializer, UpdateCardNameSerializer, UpdateCardDueDateSerializer, 
    UpdateCardDescriptionSerializer, TransferCardSerializer, ArchiveCardSerializer, CardMemberSerializer,
    CreateCardMemberSerializer, CardCommentSerializer, AddCommentSerializer, ArchiveCardMemberSerializer)


class HomeViewSet(ViewSet):
    """Board Views"""

    permission_classes = (IsAuthenticated,)

    def list_of_boards(self, *args, **kwargs):
        """
            get list of boards
        """
        board_members = BoardMember.active_objects.filter(
            user=self.request.user, board__is_active=True, is_confirmed=True)
        serializer = GetJoinedBoards(board_members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create_board(self, *args, **kwargs):
        """
            creating board end point
        """
        serializer=CreateBoardSerializer(
            data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            board=serializer.save()
            board.activity.create(user=self.request.user,
                                     action=ACTIVITY_ACTION['ADDED'],
                                     board=board)
            return Response(data=serializer.data,status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class SpecificBoardViewSet(ViewSet):
    """
        Board member with permissions
    """
    permission_classes = (IsAuthenticated, BoardMemberPermission)

    def list_of_board_detail(self, *args, **kwargs):
        """
            display board details
        """
        board_id= self.kwargs.get('board_id')
        board= get_object_or_404(Board, is_active=True, id=board_id)
        serializer= BoardNameSerializer(board)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update_board_name(self, *args, **kwargs):
        """
            updating board name end point
        """
        board = get_object_or_404(Board,pk=self.request.data['id'])
        serializer=BoardNameSerializer(instance=board, data=self.request.data)
        if serializer.is_valid():
            board = serializer.save()
            if board:
                board.activity.create(user=self.request.user,
                                          action=ACTIVITY_ACTION["UPDATED"],
                                          board=board)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update_board_status(self, *args, **kwargs):
        """
            archiving a board end point
        """
        board = get_object_or_404(Board,pk=self.request.data['id'])
        serializer=UpdateBoardStatusSerializer(instance=board, data=self.request.data)
        if serializer.is_valid():
            board = serializer.save()
            if board:
                board.activity.create(user=self.request.user,
                                         action=ACTIVITY_ACTION['ARCHIVED'],
                                         board=board)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BoardMemberViewSet(ViewSet, GetBoardMixIn):
    """
        Board member views
    """


    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def list_of_members(self, *args, **kwargs):
        """
            get list of members
        """
        board_id = self.kwargs.get('board_id')
        board_members = BoardMember.active_objects.filter(board__id=board_id)
        serializer = ListOfMembers(board_members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def invite_member(self, *args, **kwargs):
        """
            invite member
        """
        serializer=InviteMemberSerializer(data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            board_member=serializer.save()
            board_member.activity.create(user=self.request.user,
                            action=ACTIVITY_ACTION['INVITED'],
                            board=self.get_board())
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def remove_members(self, *args, **kwargs):
        serializer=ArchiveMembers(data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            # Need some refactoring. As I don't know how the front end sends data
            board_member=serializer.save()
            board_member.activity.create(user=self.request.user,
                            action=ACTIVITY_ACTION['REMOVED'],
                            board=self.get_board())
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserValidationViewSet(ViewSet):
    """
        User validation view set
    """

    def display_user_validation(self, *args, **kwargs):
        # WIP
        token = self.kwargs.get('token')
        referral = get_object_or_404(Referral, token=token, is_active = True)
        serializer= ReferralValidationSerializer(referral)
        return Response(serializer.data, status=status.HTTP_200_OK)
       

class ColumnViewSet(ViewSet, GetBoardMixIn):
    """
        Column view set
    """
    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def list_of_column_in_board(self, *args, **kwargs):
        board_id= self.kwargs.get('board_id')
        board_columns = Column.active_objects.filter(board__id=board_id, is_active=True)
        serializer = ColumnSerializer(board_columns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create_column(self, *args, **kwargs):
        serializer=CreateColumnSerializer(data=self.request.data)
        if serializer.is_valid():
            column=serializer.save()
            column.activity.create(user=self.request.user,
                                   action=ACTIVITY_ACTION['ADDED'],
                                   board=self.get_board())
            return Response(data=serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update_column(self, *args, **kwargs):
        column = get_object_or_404(Column, pk=self.request.data.get('id', None))
        if self.request.data['action'] == "update":
            serializer = UpdateColumnNameSerializer(instance=column, data=self.request.data)
            if serializer.is_valid():
                column=serializer.save()
                column.activity.create(user=self.request.user,
                                       action=ACTIVITY_ACTION['UPDATED'],
                                       board=self.get_board())
                return Response(data=serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif self.request.data['action'] == "transfer":
                # Some thing might change to accomodate the new position that conflicts
                #   with other column
            serializer = UpdatePositionSerializer(instance=column, data=self.request.data)
            if serializer.is_valid():
                column=serializer.save()
                column.activity.create(user=self.request.user,
                                       action=ACTIVITY_ACTION['TRANSFERRED'],
                                       board=self.get_board())
                return Response(data=serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Falls here if archived
        serializer = ArchiveColumnSerializer(instance=column, data=self.request.data)
        if serializer.is_valid():
            column=serializer.save()
            column.activity.create(user=self.request.user,
                                   action=ACTIVITY_ACTION['ARCHIVED'],
                                   board=self.get_board())
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ColumnDetailViewSet(ViewSet, GetBoardMixIn):
    """
        Column Details View Set
    """

    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def get_column_detail(self, *args, **kwargs):
        column_id=self.kwargs.get('column_id')
        column = get_object_or_404(Column, pk=column_id)
        serializer = ColumnDetailSerializer(column)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CardViewSet(ViewSet, GetBoardMixIn):
    """
        Card View Set
    """

    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def list_of_cards_in_a_column(self, *args, **kwargs):
        column_id= self.kwargs.get('column_id')
        cards= Card.active_objects.filter(column__pk=column_id)
        serializer= ListCardSerializer(cards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create_card(self, *args, **kwargs):
        serializer=CreateCardSerializer(data=self.request.data)
        if serializer.is_valid():
            card=serializer.save()
            card.activity.create(user=self.request.user,
                                 action=ACTIVITY_ACTION['ADDED'],
                                 board=self.get_board())
            return Response(data=serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SpecificCardViewSet(ViewSet, GetBoardMixIn):
    """
        Specific Card View Set
    """

    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def update_card(self, *args, **kwargs):
        card_id = self.kwargs.get('card_id')
        card = get_object_or_404(Card,pk=card_id)
        UpdateCardDescriptionSerializer

        if self.request.data['action'] == "name":
            serializer = UpdateCardNameSerializer(instance=card, data=self.request.data)
            if serializer.is_valid():
                card=serializer.save()
                card.activity.create(user=self.request.user,
                                     action=ACTIVITY_ACTION['UPDATE_CARD_NAME'],
                                     board=self.get_board())
                return Response(data=serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif self.request.data['action'] == "description":
            serializer = UpdateCardDescriptionSerializer(instance=card, data=self.request.data)
            if serializer.is_valid():
                card=serializer.save()
                card.activity.create(user=self.request.user,
                                     action=ACTIVITY_ACTION['UPDATE_CARD_DESCRIPTION'],
                                     board=self.get_board())
                return Response(data=serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif self.request.data['action'] == "due date":
            # YYYY-MM-DDThh:mm[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z]
            # 2012-09-04 06:00
            serializer = UpdateCardDueDateSerializer(instance=card, data=self.request.data)
            if serializer.is_valid():
                card=serializer.save()
                card.activity.create(user=self.request.user,
                                     action=ACTIVITY_ACTION['UPDATE_DUE_DATE'],
                                     board=self.get_board())
                return Response(data=serializer.data, status=status.HTTP_200_OK)
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        elif self.request.data['action'] == "transfer":
            serializer = TransferCardSerializer(instance=card, data=self.request.data)
            if serializer.is_valid():
                # Some thing might change to accomodate the new position that conflicts
                #   with other cards
                card=serializer.save()
                card.activity.create(user=self.request.user,
                                     action=ACTIVITY_ACTION['TRANSFERRED'],
                                     board=self.get_board())
                return Response(data=serializer.data, status=status.HTTP_200_OK)
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # fallse here if archived
        serializer = ArchiveCardSerializer(instance=card, data=self.request.data)
        if serializer.is_valid():
            card=serializer.save()
            card.activity.create(user=self.request.user,
                                 action=ACTIVITY_ACTION['ARCHIVED'],
                                 board=self.get_board())
            return Response(data= serializer.data, status=status.HTTP_200_OK)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST) 


class SpecificCardMember(ViewSet, GetBoardMixIn):
    """
        Specific Card Member View Set
    """
    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def list_of_card_member(self, *args, **kwargs):
        """
            get list of boards
        """
        card_id = self.kwargs.get('card_id')
        card_members = CardMember.active_objects.filter(card__id=card_id)
        serializer = CardMemberSerializer(card_members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def assign_card_member(self, *args, **kwargs):
        # Could change depending on how the data is passed
        serializer=CreateCardMemberSerializer(data=self.request.data)
        if serializer.is_valid():
            card_member=serializer.save()
            card_member.activity.create(user=self.request.user,
                                        action=ACTIVITY_ACTION['ASSIGNED'],
                                        board=self.get_board())
            return Response(data=serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def remove_card_member(self, *args, **kwargs):
        # Could change depending on how the data is passed
        board_member = self.request.data['board_member']
        card_member = get_object_or_404(CardMember, board_member=board_member, is_active=True)
        serializer=UpdateBoardStatusSerializer(instance=card_member, data=self.request.data)
        if serializer.is_valid():
            card_member = serializer.save()
            # Need some refactoring. As I don't know how the front end sends data
            card_member.activity.create(user=self.request.user,
                                        action=ACTIVITY_ACTION['UNASSIGNED'],
                                        board=self.get_board())
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CardComments(ViewSet, GetBoardMixIn):
    """
        Card Comments View Set
    """

    permission_classes =(IsAuthenticated, BoardMemberPermission)

    def list_of_comment_in_a_card(self, *args, **kwargs):
        card_id = self.kwargs.get('card_id')
        card_comments = CardComment.active_objects.filter(card__id=card_id)
        serializer = CardCommentSerializer(card_comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def add_comment(self, *args, **kwargs):
        serializer=AddCommentSerializer(data=self.request.data, context={"request": self.request})
        if serializer.is_valid():
            card_comment=serializer.save()
            card_comment.activity.create(user=self.request.user,
                                         action=ACTIVITY_ACTION['ADDED'],
                                         board=self.get_board())
            return Response(data=serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def remove_comment(self, *args, **kwargs):
        comment_id = self.request.data['id']
        card_comment = get_object_or_404(CardComment, pk=comment_id)
        serializer=ArchiveCardMemberSerializer(instance=card_comment, data=self.request.data)
        if serializer.is_valid():
            card_comment = serializer.save()
            card_comment.activity.create(user=self.request.user,
                                         action=ACTIVITY_ACTION['REMOVED'],
                                         board=self.get_board())
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


