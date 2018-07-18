from rest_framework import serializers
from rest_framework.compat import authenticate
from .models import User
from rest_framework.validators import UniqueValidator


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def clean(self):
        email = self.validated_data.get('email')
        password = self.validated_data.get('password')
        password1 = self.validated_data.get('confirm_password')


        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email address is already taken.')

        if password != password1:
            raise serializers.ValidationError('Passwords do not match.')

    def create(self):
        user = User.objects.create_user(
            self.validated_data.get('email'), self.validated_data.get('password'))
        user.save()
        return user
