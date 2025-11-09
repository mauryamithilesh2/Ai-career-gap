from rest_framework import serializers
from .models import Resume, JobDescription, UserProfile, AnalysisResult, PasswordResetToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import secrets

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'username', 'first_name', 'last_name', 'email', 'phone', 'bio', 'created_at', 'updated_at', 'last_login', 'is_verified']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'username']
    
    def validate_phone(self, value):
        import re
        if value:  # Phone is optional in profile update
            # Remove spaces, dashes, and parentheses for validation
            cleaned = re.sub(r'[\s\-\(\)]', '', value)
            
            # Check if it's a valid phone number (10-15 digits, optionally starting with +)
            phone_regex = r'^(\+?\d{1,3})?[\d]{10,15}$'
            if not re.match(phone_regex, cleaned):
                raise serializers.ValidationError("Please enter a valid phone number (e.g., +91 9876543210 or 9876543210)")
        
        return value

    def update(self, instance, validated_data):
        # Extract user data from validated_data (nested under 'user' due to source='user.field')
        user_data = validated_data.pop('user', {})
        
        # Update UserProfile fields
        if 'phone' in validated_data:
            instance.phone = validated_data['phone']
        if 'bio' in validated_data:
            instance.bio = validated_data['bio']
        instance.save()
        
        # Update User fields if provided
        user = instance.user
        user_updated = False
        
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
            user_updated = True
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
            user_updated = True
        if 'email' in user_data:
            user.email = user_data['email']
            user_updated = True
        
        if user_updated:
            user.save()
        
        return instance


# class ResumeSerializer(serializers.ModelSerializer):
#     user = serializers.PrimaryKeyRelatedField(read_only=True)
#     file_size_mb = serializers.ReadOnlyField()
#     username = serializers.CharField(source='user.username', read_only=True)

#     class Meta:
#         model = Resume
#         fields = ['id', 'user', 'username', 'file', 'parsed_text', 'uploaded_at', 'updated_at', 
#                  'file_size', 'file_size_mb', 'file_type', 'is_processed', 'processing_status']
#         read_only_fields = ['id', 'user', 'uploaded_at', 'updated_at', 'file_size', 'file_type', 'is_processed', 'processing_status']

class ResumeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    file_content = serializers.SerializerMethodField()  # <-- optional: to view stored binary as base64 (for admin/debug)

    class Meta:
        model = Resume
        fields = [
            'id', 'user', 'username', 'file_name', 'parsed_text', 'uploaded_at', 'updated_at',
            'file_size', 'file_size_mb', 'file_type', 'is_processed', 'processing_status',
            'file_content'  # optional: remove if you don't want to expose binary data
        ]
        read_only_fields = [
            'id', 'user', 'uploaded_at', 'updated_at',
            'file_size', 'file_type', 'is_processed', 'processing_status'
        ]

    def get_file_content(self, obj):
        """
        Returns base64 encoded binary data — useful for internal testing only.
        You can remove this field before production if unnecessary.
        """
        import base64
        if hasattr(obj, 'file_data') and obj.file_data:
            return base64.b64encode(obj.file_data).decode('utf-8')
        return None

class JobDescriptionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = JobDescription
        fields = ['id', 'user', 'username', 'title', 'company', 'location', 'description', 
                 'requirements', 'salary', 'job_type', 'uploaded_at', 'updated_at', 
                 'is_analyzed', 'analysis_status']
        read_only_fields = ['id', 'user', 'uploaded_at', 'updated_at', 'is_analyzed', 'analysis_status']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=True, max_length=20)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate required fields
        if not attrs.get('first_name') or len(attrs.get('first_name', '')) < 2:
            raise serializers.ValidationError("First name is required and must be at least 2 characters long")
        
        if not attrs.get('last_name') or len(attrs.get('last_name', '')) < 2:
            raise serializers.ValidationError("Last name is required and must be at least 2 characters long")
        
        if not attrs.get('username') or len(attrs.get('username', '')) < 3:
            raise serializers.ValidationError("Username is required and must be at least 3 characters long")
        
        if not attrs.get('phone'):
            raise serializers.ValidationError("Phone number is required")
        
        return attrs

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Username is required")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists")
        return value

    def validate_phone(self, value):
        import re
        if not value:
            raise serializers.ValidationError("Phone number is required")
        
        # Remove spaces, dashes, and parentheses for validation
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        
        # Check if it's a valid phone number (10-15 digits, optionally starting with +)
        phone_regex = r'^(\+?\d{1,3})?[\d]{10,15}$'
        if not re.match(phone_regex, cleaned):
            raise serializers.ValidationError("Please enter a valid phone number (e.g., +91 9876543210 or 9876543210)")
        
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        validated_data.pop('password_confirm')
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
            )
            # Create user profile with phone number
            UserProfile.objects.create(user=user, phone=phone)
            return user
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating user: {e}", exc_info=True)
            raise serializers.ValidationError(f"Error creating user: {str(e)}")


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=attrs['token'],
                is_used=False
            )
            if reset_token.is_expired():
                raise serializers.ValidationError("Reset token has expired")
            attrs['reset_token'] = reset_token
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired reset token")
        
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class AnalysisResultSerializer(serializers.ModelSerializer):
    resume_title = serializers.CharField(source='resume.file.name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = AnalysisResult
        fields = ['id', 'user', 'resume', 'job', 'resume_title', 'job_title', 
                 'analysis_type', 'result_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_resumes = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    total_analyses = serializers.IntegerField()
    recent_activities = serializers.ListField()
    match_accuracy = serializers.FloatField()
    avg_analysis_time = serializers.FloatField()










    # this serialize class for resume generation features

class ResumeInputSerializer(serializers.Serializer):
    name = serializers.CharField()
    role = serializers.CharField(required=False)
    education = serializers.CharField()
    skills = serializers.CharField()
    projects = serializers.ListField(child=serializers.CharField(), required=False)
    internship = serializers.CharField(required=False)
    achievements = serializers.ListField(child=serializers.CharField(), required=False)