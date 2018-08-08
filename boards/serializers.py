from activities.constants import ACTIVITY_ACTION

from annoying.functions import get_object_or_None

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.core.validators import validate_email as dj_validate_email
from django.conf import settings
from django.shortcuts import get_object_or_404, reverse

from rest_framework import serializers
from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer
from rest_framework_jwt.settings import api_settings

from  users.models import User

from .models import Board, Card, Column, Referral, BoardMember, CardMember, CardComment
from .mixins import ArchiveMemberMixIn, JoinBoardMixIn
from .tasks import send, error_handler


class CreateBoardSerializer(serializers.ModelSerializer):
    """
        Serializer for creating a new board
    """

    owner = serializers.PrimaryKeyRelatedField(required=False, queryset=get_user_model().objects.all())

    class Meta:
        model = Board
        fields = ('name', 'owner')

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


class GetBoard(serializers.ModelSerializer):
    """
        Serializer for updating the board name
    """
    show_owner_buttons = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ('id','name','show_owner_buttons')

    def get_show_owner_buttons(self, obj):
        if obj.owner == self.context.get('request').user:
            return True
        return False


class CompletedValidationSerializer(serializers.ModelSerializer):
    """
        Serializer for updating the board name
    """
    auth_token = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ('id','name', 'auth_token')

    def get_auth_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        payload = jwt_payload_handler(self.context.get('user'))
        authenticated = jwt_encode_handler(payload)
        return authenticated



class GetJoinedBoards(serializers.ModelSerializer):
    """
        getting joined boards
    """
    board_name = serializers.CharField(source='board.name')
    board_id = serializers.IntegerField(source='board.id')
    class Meta:
        model = Board
        fields = ('board_id', 'board_name')

class UpdateBoardStatusSerializer(serializers.ModelSerializer):
    """
        Serializer for toggling the active status of the board
    """

    class Meta:
        model = Board
        fields = ('id','is_active')


class UpdateBoardMemberStatusSerializer(serializers.ModelSerializer):


    """
        Archiving bulk meember
    """
    bulk_id = serializers.ListField(
        child = serializers.IntegerField()
    )

    class Meta:
        model = CardMember
        fields = ('bulk_id', 'is_active')

    def create(self):
        # This could change depending on how the front end sends data
        is_active= self.validated_data.get("is_active")
        for each_id in self.validated_data.get("bulk_id"):
            try:
                to_update = CardMember.active_objects.get(id=each_id)
                to_update.is_active = is_active
                to_update.save()
                # Need some refactoring. As I don't know how the front end sends data
                to_update.activity.create(user=self.context.get('request').user,
                                        action=ACTIVITY_ACTION['UNASSIGNED'],
                                        board=to_update.board_member.board,
                                        constant_updated_value= to_update.card.name)
            except Exception as e:
                print(e)



class ListCardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = ('id' , 'name', 'is_overdue')


class InviteMemberSerializer(serializers.ModelSerializer):
    """
        Serializer for inviting a member
    """

    board_id = serializers.CharField(write_only=True)

    class Meta:
        model = Referral
        fields = ('email', 'board_id', 'id')

    def create(self, *args, **kwargs): 
        # Creating New Referral
        new_referral = Referral(email=self.validated_data.get("email"))
        board_id = self.validated_data.get('board_id')
        new_referral.generate_token()
        
        validation_url = settings.VALIDATION_URL + new_referral.token + '/'
        host = settings.BASE_URL
        inviter = self.context.get('request').user
        board = get_object_or_404(Board, pk=board_id)

        # formatting string to send
        full_activation_link = f'{host}{validation_url}'
        full_message = ("{} has invited you to join '{}' board! \n" 
                "Click the link to join the board. \n{}").format(
                    inviter.email, board.name, full_activation_link)

        new_referral.board = board
        new_referral.inviter = inviter

        # Gets if the email has a user
        user = get_object_or_None(User, email=self.validated_data.get("email"))
        new_referral.user = user
        new_referral.save()

        # Celery Email Sync
        send.apply_async((
            full_message, settings.EMAIL, [self.validated_data.get("email")]))
        return new_referral



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

    def validate_email(self, value):
        try:
            dj_validate_email(value)
        except ValidationError as e:
            raise serializers.ValidationError('This is not a valid email.')
        return value


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
            self.remove_member(email, board, self.context.get('request').user)


class LeaveBoard(serializers.ModelSerializer, ArchiveMemberMixIn):
    """
        Archiving bulk meember
    """
    email = serializers.SerializerMethodField()

    class Meta:
        model = BoardMember
        fields = ('email', 'board')

    def save(self):
        # This could change depending on how the front end sends data
        board= self.validated_data.get("board")
        email= self.data.get("email")

        self.remove_member(email, board, self.context.get('request').user)

    def get_email(self, obj):
        return self.context.get('request').user.email


class ListOfMembers(serializers.ModelSerializer):
    """
        List of members
    """
    member = serializers.SerializerMethodField()

    class Meta:
        model = BoardMember
        fields = ('member','id')

    def get_member(self, obj):
        # checks if the user is still pending
        if obj.user:
            to_return = obj.user.email
            if not obj.is_confirmed:
                to_return += " (Pending)"  
            return to_return
        referral = get_object_or_None(Referral, board_member__pk=obj.id)
        return referral.email + " (Pending)"


class ReferralValidationSerializer(serializers.ModelSerializer):

    has_account = serializers.SerializerMethodField()
    board_name = serializers.CharField(source='board_member.board.name')
    class Meta:
        model = Referral
        fields = ('id', 'has_account','email', 'board_name')

    def get_has_account(self, obj):
        return bool(obj.board_member.user)




class ColumnSerializer(serializers.ModelSerializer):


    class Meta:
        model = Column
        fields = ('position', 'name', 'id')

class CreateColumnSerializer(serializers.ModelSerializer):

    class Meta:
        model = Column
        fields = ('name', 'board', 'id', 'position')


class UpdateColumnNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Column
        fields= ('name', 'id' , 'board')


class UpdatePositionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Column
        fields = ('position', 'id' , 'board')


class ArchiveColumnSerializer(serializers.ModelSerializer):

    class Meta:
        model = Column
        fields = ('is_active', 'id' , 'board')


class ColumnDetailSerializer(serializers.ModelSerializer):

    number_of_cards = serializers.SerializerMethodField()

    class Meta:
        model = Column
        fields = ('name', 'position','number_of_cards')

    def get_number_of_cards(self, obj):
        return obj.count()


class GetDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model= Card
        fields = ('name', 'description','id', 'due_date')

class CreateCardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = ('name', 'column','id')


class UpdateCardNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = ('name', 'id')


class UpdateCardDescriptionSerializer(serializers.ModelSerializer):

    description = serializers.CharField(allow_blank=True)

    class Meta:
        model = Card
        fields = ('description', 'id')


class UpdateCardDueDateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = ('due_date', 'id','is_overdue')


class TransferCardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = ('position', 'id', 'column')


class ArchiveCardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Card
        fields = ('id' , 'is_active')


class CardMemberSerializer(serializers.ModelSerializer):

    already_member = serializers.SerializerMethodField()
    Checked = serializers.SerializerMethodField()
    card_member_id = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = BoardMember
        fields = ('email', 'id', 'already_member', 'Checked', 'card_member_id')

    def scan_member(self, obj):
        exists = CardMember.active_objects.filter(board_member__pk=obj.id)
        if exists:
            return True
        return False

    def get_Checked(self, obj):
        return (self.scan_member(obj));

    def get_already_member(self, obj):
        return (self.scan_member(obj));

    def get_card_member_id(self, obj):
        exists = get_object_or_None(CardMember,board_member__pk=obj.id, is_active=True)
        if exists:
            return exists.id
        return None



class CreateCardMemberSerializer(serializers.ModelSerializer):

    bulk_board_member = serializers.ListField(
        child = serializers.IntegerField()
    )

    class Meta:
        model = CardMember
        fields = ('card', 'bulk_board_member')

    def validate(self, data):
        for board_member in data["bulk_board_member"]:
            exists = CardMember.active_objects.filter(board_member=board_member, card=data["card"])
            if exists:
                # Something went wrong in handling the data from the front end
                raise serializers.ValidationError("A board member is already assigned!")
        return data

    def create(self):
        # This could change depending on how the front end sends data
        card= self.validated_data.get("card")
        for board_member_id in self.validated_data.get("bulk_board_member"):
            board_member = BoardMember.active_objects.get(pk=board_member_id)
            instance = CardMember(board_member=board_member,card=card)
            instance.save()
            instance.activity.create(user=self.context.get('request').user,
                                        action=ACTIVITY_ACTION['ASSIGNED'],
                                        board=board_member.board, 
                                        constant_updated_value=card.name)


class ArchiveCardMemberSerializer(serializers.ModelSerializer):


    class Meta:
        model = CardMember
        fields = ('is_active', 'board_member')



class CardCommentSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(source='user.email')
    owner = serializers.SerializerMethodField()

    class Meta:
        model = CardComment
        fields = ('comment', 'email', 'date_commented', 'id', 'humanize_time', 'owner')

    def get_owner(self, obj):
        if self.context.get('request').user.email == obj.user.email:
            return True
        return False


class AddCommentSerializer(serializers.ModelSerializer):

    user = serializers.PrimaryKeyRelatedField(required=False, queryset=get_user_model().objects.all())
    email = serializers.CharField(read_only=True,source='user.email')
    owner = serializers.SerializerMethodField()

    class Meta:
        model = CardComment
        fields =  ('comment', 'user', 'card', 'email', 'humanize_time', 'id', 'owner')

    def validate(self, data):
        """
            putting owner since we didn't pass owner on the first initalization of data
        """
        data['user'] = self.context.get('request').user
        return super(AddCommentSerializer, self).validate(data)

    def get_owner(self, obj):
        if self.context.get('request').user.email == obj.user.email:
            return True
        return False


class ArchiveCardMemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = CardMember
        fields = ('is_active', 'id')


