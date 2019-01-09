from rest_framework import serializers
from rest_framework.compat import authenticate
from .models import User
from rest_framework.validators import UniqueValidator


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data['email']
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('Email address is already taken.')
        return data

    def validate_confirm_password(self, value):
        if self.initial_data.get('password') != value:
            raise serializers.ValidationError('Passwords do not match.')
        return value

    def create(self):
        user = User.objects.create_user(
            self.validated_data.get('email'), self.validated_data.get('password'))
        user.save()
        return user
