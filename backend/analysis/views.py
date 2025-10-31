from django.shortcuts import render
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action,api_view,permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated,AllowAny

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import secrets
import os

from .models import Resume, JobDescription, UserProfile, AnalysisResult, PasswordResetToken
from .serializers import (
    ResumeSerializer, JobDescriptionSerializer, RegisterSerializer, 
    LoginSerializer, UserSerializer, UserProfileSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ChangePasswordSerializer, AnalysisResultSerializer, DashboardStatsSerializer
)


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        if file:
            serializer.save(
                user=self.request.user,
                file_size=file.size,
                file_type=file.content_type
            )

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        resume = self.get_object()
        resume.processing_status = 'processing'
        resume.save()
        
        # Here you would implement the actual resume analysis logic
        # For now, we'll just simulate it
        resume.parsed_text = f"Analyzed resume for {resume.user.username}"
        resume.processing_status = 'completed'
        resume.is_processed = True
        resume.save()
        
        return Response({'status': 'Analysis completed'})


class JobDescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = JobDescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobDescription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        job = self.get_object()
        job.analysis_status = 'analyzing'
        job.save()
        
        # Here you would implement the actual job analysis logic
        job.analysis_status = 'completed'
        job.is_analyzed = True
        job.save()
        
        return Response({'status': 'Analysis completed'})


from django.http import JsonResponse
@api_view(['GET'])
def home(request):
    return JsonResponse({
        'message': 'Welcome to Career Gap Analyzer API!',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'resumes': '/api/resumes/',
            'jobs': '/api/jobs/',
            'dashboard': '/api/dashboard/',
        }
    })


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        print("Registration request data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            print("Serializer is valid")
            user = serializer.save()
            print("User created successfully:", user.username)
            
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
            return Response({
                'errors': serializer.errors,
                'data_received': request.data
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login
            try:
                profile = user.profile
                profile.last_login = timezone.now()
                profile.save()
            except UserProfile.DoesNotExist:
                UserProfile.objects.create(user=user, last_login=timezone.now())
            
            # Generate JWT tokens
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            })
        
        # Return detailed error information for debugging
        return Response({
            'errors': serializer.errors,
            'data_received': request.data
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful'})
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate reset token
            token = secrets.token_urlsafe(32)
            expires_at = timezone.now() + timedelta(hours=1)
            
            # Create or update reset token
            reset_token, created = PasswordResetToken.objects.get_or_create(
                user=user,
                defaults={'token': token, 'expires_at': expires_at}
            )
            if not created:
                reset_token.token = token
                reset_token.expires_at = expires_at
                reset_token.is_used = False
                reset_token.save()
            
            # Send email (in production, you'd use a proper email service)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            
            # For development, just return the token
            return Response({
                'message': 'Password reset email sent',
                'reset_url': reset_url  # Remove this in production
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            reset_token = serializer.validated_data['reset_token']
            new_password = serializer.validated_data['new_password']
            
            # Update password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.save()
            
            return Response({'message': 'Password reset successful'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            new_password = serializer.validated_data['new_password']
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Calculate stats
        total_resumes = Resume.objects.filter(user=user).count()
        total_jobs = JobDescription.objects.filter(user=user).count()
        total_analyses = AnalysisResult.objects.filter(user=user).count()
        
        # Recent activities
        recent_activities = []
        
        # Recent resumes
        recent_resumes = Resume.objects.filter(user=user)[:3]
        for resume in recent_resumes:
            recent_activities.append({
                'type': 'resume',
                'title': resume.file.name,
                'time': resume.uploaded_at,
                'status': resume.processing_status,
                'icon': '📄'
            })
        
        # Recent jobs
        recent_jobs = JobDescription.objects.filter(user=user)[:3]
        for job in recent_jobs:
            recent_activities.append({
                'type': 'job',
                'title': job.title,
                'time': job.uploaded_at,
                'status': job.analysis_status,
                'icon': '💼'
            })
        
        # Recent analyses
        recent_analyses = AnalysisResult.objects.filter(user=user)[:3]
        for analysis in recent_analyses:
            recent_activities.append({
                'type': 'analysis',
                'title': f"{analysis.analysis_type.replace('_', ' ').title()}",
                'time': analysis.created_at,
                'status': 'completed',
                'icon': '📊'
            })
        
        # Sort by time
        recent_activities.sort(key=lambda x: x['time'], reverse=True)
        recent_activities = recent_activities[:5]
        
        stats = {
            'total_resumes': total_resumes,
            'total_jobs': total_jobs,
            'total_analyses': total_analyses,
            'recent_activities': recent_activities,
            'match_accuracy': 95.0,  # This would be calculated from actual data
            'avg_analysis_time': 2.3  # This would be calculated from actual data
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

from rest_framework.parsers import MultiPartParser, FormParser

class ResumeUploadView(generics.CreateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        if file:
            serializer.save(
                user=self.request.user,
                file_size=file.size,
                file_type=file.content_type
            )


class JobUploadView(generics.CreateAPIView):
    queryset = JobDescription.objects.all()
    serializer_class = JobDescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)






#it is for analysis of skills

from .nlp_module.job_resume_analyzer import analyze_gap
@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_resume_job(request):
    resume_text = request.data.get('resume_text','')
    job_text = request.data.get('job_text','')


    if not resume_text or not job_text:
        return Response({"error":"Both resume_text and job_text are required."})
    
    result = analyze_gap(resume_text,job_text)
    return Response(result)