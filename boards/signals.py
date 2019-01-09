from .models import Board, BoardMember, Referral
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

@receiver(post_save, sender=Board)
def add_board_member(sender, instance, created, **kwargs):
    if created:
        new_board_member = BoardMember(user=instance.owner,board=instance)
        new_board_member.is_confirmed = True
        new_board_member.save()

@receiver(pre_save, sender=Referral)
def sending_email_board_member(sender, instance, **kwargs):
    new_board_member = BoardMember(user=instance.user,board=instance.board)
    new_board_member.is_confirmed = False
    new_board_member.save()
    instance.board_member = new_board_member
    # Cleaning the temporary attribute that was passed to the instance before saving
    del instance.user
    del instance.board
