from django.contrib import admin
from .models import Board, BoardMember, Referral, Column

admin.site.register(Board)
admin.site.register(BoardMember)
admin.site.register(Referral)
admin.site.register(Column)
