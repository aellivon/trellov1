from activities.constants import ACTIVITY_ACTION

from celery import shared_task
from trello.celery import app

from django.core.mail import send_mail

from celery.contrib import rdb

@app.task
def send(full_message, sender, receiver):
    send_mail(
        'Invitation Request',
        full_message,
        sender,
        receiver,
        fail_silently=False,
    )


@app.task
def error_handler():
    print("email failed")