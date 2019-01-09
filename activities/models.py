from datetime import datetime

from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.humanize.templatetags.humanize import naturaltime

from users.models import User

from trello.models import CommonInfo

class Activity(CommonInfo):
    """
        models for activity
    """
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="initial_user"
    )
    action = models.CharField(max_length=50)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    modified = models.DateTimeField(default=datetime.now)
    old_value = models.CharField(null=True, max_length=225)

    constant_updated_value = models.CharField(max_length=225, blank=True, null=True)
    # Getting boards without importing
    board = models.ForeignKey('boards.Board', on_delete=models.CASCADE)

    def __str__(self):
        return "{}".format(self.user.email + " " + self.action) 
        
    class Meta:
        verbose_name = "Activity"
        verbose_name_plural = "Activities"

    @property 
    def humanize_time(self):
        return naturaltime(self.modified)

    def safe_get(self, model, *attrs):
        # To do : improve this

        for attr in attrs:
            try:
                model = getattr(model, attr)
            except ValueError:
                return ""
        return model

    def activity_stream_heading(self):
        content_type = self.content_type.name
        output = {
            'card': {
                'property': ['name'],
                'str': ' card named "{}"'
            },
            'list': {
                'property': ['name'],
                'str': ' list named "{}"'
            },
            'column': {
                'property': ['name'],
                'str': ' column named "{}"'
            },
            'referral': {
                'property': ['email'],
                'str': ' "{}"'
            },
            'board member': {
                'property': ['user', 'email'],
                'str':  ' "{}"',
                'second_property': ['board', 'name'],
                'second_str': 'the board "{}"' 
            },
            'board': {
                'property': ['name'],
                'str': ' board named "{}"'
            },
            'card member': {
                'property': ['board_member','user', 'email'],
                'str': ' {} to the card'
            },
            'card comment': {
                'property': ['comment'],
                'str': ' comment "{}" on  a card'
            }
        }

        # * makes *args know that you are passing a list
        val = ""
        if self.action != "joined" and self.action != "left":
            val = self.safe_get(self.content_object,*output[content_type]['property'])
        else:
            val = self.safe_get(self.content_object,*output[content_type]['second_property'])

        second_string = ""
        if self.constant_updated_value != None:
            second_string = '"' +  self.constant_updated_value + '"'

        if self.action != "joined" and self.action != "left":
            return self.user.email + " " +  self.action + " " + output[content_type]['str'].format(val) + " " + second_string
        else:
            return self.user.email + " " +  self.action + " " + output[content_type]['second_str'].format(val)  + " " + second_string
       


    @property
    def humanize_activity(self):
        return self.activity_stream_heading()
    