from annoying.functions import get_object_or_None

from .models import Board, Referral, BoardMember

class ArchiveMemberMixIn():
    """
        This mix in was created so that the archive member code can be recycled
    """

    def remove_member(self, to_remove_email, board):
        # Referral removal
        referral_exists= get_object_or_None(Referral,
                email=to_remove_email, is_active= True)
        if referral_exists:
            Referral.objects.filter(
                email= to_remove_email,is_active=True).update(is_active=False)
            board_member = referral_exists.board_member
            board_member.is_active = False
            board_member.save()
        else:
            board_member= get_object_or_None(
                BoardMember, user__email=to_remove_email, board=board, is_active = True)
            if board_member:
                board_member.is_active = False
                board_member.save()