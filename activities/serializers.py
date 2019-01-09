from rest_framework import serializers

from .models import Activity


class AllActivitySerializer(serializers.ModelSerializer):

    board_name = serializers.CharField(source='board.name')

    class Meta:
        model = Activity
        fields = ('humanize_time', 'humanize_activity', 'board_name')
