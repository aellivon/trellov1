from activities.constants import ACTIVITY_ACTION

from annoying.functions import get_object_or_None

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404, reverse

from rest_framework import serializers

from  users.models import User

from .models import Board, Referral, BoardMember
from .mixins import ArchiveMemberMixIn


class CreateBoardSerializer(serializers.ModelSerializer):
    """
        Serializer for creating a new board
    """

    owner = serializers.PrimaryKeyRelatedField(required=False, queryset=get_user_model().objects.all())

    class Meta:
        model = Board
        fields = '__all__'

    def validate(self, data):
        """
            putting owner since we didn't pass owner on the first initalization of data
        """
        data['owner'] = self.context.get('request').user
        return super(CreateBoardSerializer, self).validate(data)


class BoardNameSerializer(serializers.ModelSerializer):
    """
        Serializer for updating the board name
    """
    class Meta:
        model = Board
        fields = ('id','name')


class GetJoinedBoards(serializers.ModelSerializer):
    """
        getting joined boards
    """
    board_name = serializers.CharField(source='board.name')
    class Meta:
        model = Board
        fields = ('id', 'board_name')

class UpdateBoardStatusSerializer(serializers.ModelSerializer):
    """
        Serializer for toggling the active status of the board
    """

    class Meta:
        model = Board
        fields = ('id','is_active')


class InviteMemberSerializer(serializers.ModelSerializer):
    """
        Serializer for inviting a member
    """

    board_id = serializers.CharField(write_only=True)

    class Meta:
        model = Referral
        fields = ('email', 'board_id')

    def save(self): 
        # Creating New Referral
        new_referral = Referral(email=self.validated_data.get("email"))
        board_id = self.validated_data.get('board_id')
        new_referral.generate_token()
        
        validation_url = (reverse('boards:user_validation', 
            kwargs={'token':new_referral.token}))
        host = settings.BASE_URL
        inviter = self.context.get('request').user
        board = get_object_or_404(Board, pk=board_id)

        # formatting string to send
        full_activation_link = f'{host}{validation_url}'
        full_message = ("{} has invited you to join '{}' board! \n" 
                "Click the link to join the board. \n{}").format(
                    inviter.email, board.name, full_activation_link)

        send_mail(
            'Invitation Request',
            full_message,
            settings.EMAIL,
            [self.validated_data.get("email")],
            fail_silently=False,
        )

        # Passing in the instance so that the board member signal can save the board
        new_referral.board = board

        # Gets if the email has a user
        user = get_object_or_None(User, email=self.validated_data.get("email"))
        new_referral.user = user
        new_referral.save()

    def validate(self, data):
        # Checking if the email is already a board member or already invited
        email = data['email']
        board_id = data['board_id']
        exists = get_object_or_None(
                BoardMember, user__email=email,
                board__id=board_id, is_active = True)
        if exists:
            raise serializers.ValidationError({'email': ['This user is already a board member!']})

        exists = get_object_or_None(
                Referral, email=email, board_member__board__id=board_id,
                is_active=True
            )

        if exists:
            raise serializers.ValidationError({'email': ['This user is already invited!']})
        return data

class ArchiveMember(serializers.ModelSerializer, ArchiveMemberMixIn):
    """
        Serializer for archiving one member
    """

    email = serializers.EmailField()

    class Meta:
        model = BoardMember
        fields = ('email', 'board')

    def save(self):
        to_remove_email= self.validated_data.get("email")
        board= self.validated_data.get("board")
        self.remove_member(to_remove_email, board)


class ArchiveMembers(serializers.ModelSerializer, ArchiveMemberMixIn):
    """
        Archiving bulk meember
    """
    bulk_email = serializers.ListField(
        child = serializers.EmailField()
    )

    class Meta:
        model = BoardMember
        fields = ('bulk_email', 'board')

    def save(self):
        # This could change depending on how the front end sends data
        board= self.validated_data.get("board")
        for email in self.validated_data.get("bulk_email"):
            self.remove_member(email, board)


class ReferralValidationSerializer(serializers.ModelSerializer):

    has_account = serializers.SerializerMethodField()
    class Meta:
        model = Referral
        fields = ('id', 'has_account')

    def get_has_account(self, obj):
        return bool(obj.board_member.user)


