from django.contrib import admin
from .models import Board, BoardMember, Referral, Column, Card, CardMember, CardComment

admin.site.register(Card)
admin.site.register(Board)
admin.site.register(BoardMember)
admin.site.register(Referral)
admin.site.register(Column)
admin.site.register(CardMember)
admin.site.register(CardComment)

