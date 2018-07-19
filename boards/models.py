from django.db import models
from django.db.models import Max

from trello.models import CommonInfo
from secrets import token_urlsafe 
from users.models import User
# from activity.models import Activity
# from django.contrib.contenttypes.fields import GenericRelation

class Board(CommonInfo):
    """
        This is the model for a board
    """
    name = models.TextField(max_length=30)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"'{self.name}' ( by '{self.owner}' )"



class BoardMember(CommonInfo):
    """
        This is the model for a board member
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    board = models.ForeignKey(Board,on_delete=models.CASCADE, related_name='board')
    is_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} is in {self.board}"

class Referral(CommonInfo):
    """
        This is the model for a referral.
        Referral are used for inviting members.
    """
    board_member = models.ForeignKey(BoardMember,on_delete=models.CASCADE)
    token = models.TextField()
    email = models.TextField()
        
    def generate_token(self):
        # Generating secure token using python 3.6 libraries
        not_found = True
        while(not_found):
            new_token = token_urlsafe(32)
            if not Referral.objects.filter(token=new_token):
                self.token = new_token
                not_found = False



class Column(CommonInfo):
    """
        This is the model for column
    """
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    name = models.TextField()
    position = models.IntegerField(default=0)

    def increment_position(self):
        max_position=Column.objects.filter(is_active=True).aggregate(Max('position'))
        to_add_position= 1
        maximum_exists = max_position.get('position__max')
        if maximum_exists:
            to_add_position = to_add_position + maximum_exists
        return to_add_position

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        # Adding position
        if not self.id:
            to_add_position = self.increment_position()
            print (to_add_position)
            self.position = to_add_position

        return super(Column,self).save(force_insert, force_update, using,
             update_fields)

    def count(self):
        return Card.active_objects.filter(column__id=self.pk).count()



class Card(CommonInfo):
    """
        This is the model for the card
    """
    name = models.TextField()
    description = models.TextField(null=True)
    column = models.ForeignKey(Column, on_delete=models.CASCADE)
    position = models.IntegerField()
    due_date = models.DateTimeField(null=True)

    def __str__(self):
        return "{}".format(self.name)

    # Mabalik na ni sa json
    @property
    def is_overdue(self):
        return True

class CardMember(CommonInfo):
    """
        This is the model for a card member
    """
    board_member = models.ForeignKey(BoardMember, on_delete=models.CASCADE)
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    
    def __str__(self):
        return "{}-{}".format(self.card.name,self.board_member.user)

class CardComment(CommonInfo):
    """
        This is the model for a card comment
    """
    user =models.ForeignKey(User,on_delete=models.CASCADE)
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    comment = models.TextField()
    date_commented = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "{}-{}".format(self.user, self.comment)
