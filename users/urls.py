from .views import UserViews
from django.urls import path

user_sign_up =  UserViews.as_view({
    'post':'sign_up',
})


app_name = 'users'

urlpatterns = [
    path('signup/', user_sign_up, name='signup'),
]
