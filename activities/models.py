from datetime import datetime

from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from users.models import User

from trello.models import CommonInfo

class Activity(CommonInfo):
    """
        models for activity
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="initial_user"
    )
    action = models.CharField(max_length=25)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    modified = models.DateTimeField(default=datetime.now)
    old_value = models.CharField(null=True, max_length=225)
    # Getting boards without importing
    board = models.ForeignKey('boards.Board', on_delete=models.CASCADE)

    def __str__(self):
        return "{}".format(self.user) 
        
    class Meta:
        verbose_name = "Activity"
        verbose_name_plural = "Activities"