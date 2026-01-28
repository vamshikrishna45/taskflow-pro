# users/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                user = User.objects.get(email=email)
                attrs['username'] = user.username
            except User.DoesNotExist:
                # ✅ Raise clear error immediately
                from rest_framework_simplejwt.exceptions import AuthenticationFailed
                raise AuthenticationFailed('No account found with this email address')
        
        return super().validate(attrs)