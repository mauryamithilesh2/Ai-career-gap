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



from django.http import JsonResponse

@api_view(['GET'])
@permission_classes([AllowAny])
def home(request):
    """Home endpoint - accessible without authentication"""
    return JsonResponse({
        'message': 'Welcome to Career Gap Analyzer API!',
        'version': '1.0.0',
        'endpoints': {
            'api_root': '/api/',
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'password_reset': '/api/auth/password-reset/',
                'password_reset_confirm': '/api/auth/password-reset-confirm/',
                'change_password': '/api/auth/change-password/',
                'profile': '/api/auth/profile/',
            },
            'resumes': '/api/resumes/',
            'jobs': '/api/jobs/',
            'dashboard': '/api/dashboard/stats/',
            'analyze': '/api/analyze/',
            'token': {
                'obtain': '/api/token/',
                'refresh': '/api/token/refresh/',
            }
        },
        'authentication': {
            'type': 'Bearer Token (JWT)',
            'header': 'Authorization: Bearer <token>',
            'note': 'Most endpoints require authentication. Register or login to obtain a token.'
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """Serve the static API description JSON from backend/docs/api_info.json"""
    import os, json
    try:
        # file located at backend/docs/api_info.json (one level up from this module)
        file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs', 'api_info.json'))
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return JsonResponse(data, safe=False)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to load api_info.json: {e}", exc_info=True)
        return JsonResponse({'error': 'API info not available', 'details': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API Root endpoint - lists all available endpoints"""
    base_url = request.build_absolute_uri('/')[:-1]
    return Response({
        'message': 'Career Gap Analyzer API Root',
        'version': '1.0.0',
        'endpoints': {
            'home': f'{base_url}/',
            'authentication': {
                'register': {
                    'url': f'{base_url}/api/auth/register/',
                    'method': 'POST',
                    'auth_required': False,
                    'description': 'Register a new user account'
                },
                'login': {
                    'url': f'{base_url}/api/auth/login/',
                    'method': 'POST',
                    'auth_required': False,
                    'description': 'Login and obtain JWT tokens'
                },
                'logout': {
                    'url': f'{base_url}/api/auth/logout/',
                    'method': 'POST',
                    'auth_required': True,
                    'description': 'Logout and invalidate refresh token'
                },
                'password_reset': {
                    'url': f'{base_url}/api/auth/password-reset/',
                    'method': 'POST',
                    'auth_required': False,
                    'description': 'Request password reset email'
                },
                'password_reset_confirm': {
                    'url': f'{base_url}/api/auth/password-reset-confirm/',
                    'method': 'POST',
                    'auth_required': False,
                    'description': 'Confirm password reset with token'
                },
                'change_password': {
                    'url': f'{base_url}/api/auth/change-password/',
                    'method': 'POST',
                    'auth_required': True,
                    'description': 'Change user password'
                },
                'profile': {
                    'url': f'{base_url}/api/auth/profile/',
                    'method': 'GET, PATCH',
                    'auth_required': True,
                    'description': 'Get or update user profile'
                }
            },
            'resumes': {
                'url': f'{base_url}/api/resumes/',
                'methods': ['GET', 'POST'],
                'auth_required': True,
                'description': 'List or upload resumes (supports PDF, DOCX)'
            },
            'jobs': {
                'url': f'{base_url}/api/jobs/',
                'methods': ['GET', 'POST'],
                'auth_required': True,
                'description': 'List or create job descriptions'
            },
            'dashboard': {
                'url': f'{base_url}/api/dashboard/stats/',
                'method': 'GET',
                'auth_required': True,
                'description': 'Get dashboard statistics'
            },
            'analyze': {
                'url': f'{base_url}/api/analyze/',
                'method': 'POST',
                'auth_required': True,
                'description': 'Analyze resume against job description'
            },
            'token': {
                'obtain': {
                    'url': f'{base_url}/api/token/',
                    'method': 'POST',
                    'auth_required': False,
                    'description': 'Obtain JWT access and refresh tokens'
                },
                'refresh': {
                    'url': f'{base_url}/api/token/refresh/',
                    'method': 'POST',
                    'auth_required': False,
                    'description': 'Refresh JWT access token'
                }
            }
        },
        'authentication': {
            'type': 'Bearer Token (JWT)',
            'header': 'Authorization: Bearer <access_token>',
            'how_to': [
                '1. Register at /api/auth/register/ or login at /api/auth/login/',
                '2. Obtain access_token and refresh_token',
                '3. Include access_token in header: Authorization: Bearer <token>',
                '4. Use refresh_token at /api/token/refresh/ to get new access_token'
            ]
        }
    })


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User created successfully: {user.username}")
            
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        else:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Registration validation failed: {serializer.errors}")
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
import pdfplumber
from rest_framework.response import Response
from docx import Document
import os
class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def extract_text(self, file_obj, filename):
        import logging
        logger = logging.getLogger(__name__)
        
        ext = os.path.splitext(filename)[1].lower()
        text = ""

        if ext == '.pdf':
            try:
                # Reset file pointer to beginning
                if hasattr(file_obj, 'seek'):
                    file_obj.seek(0)
                with pdfplumber.open(file_obj) as pdf:
                    text = "\n".join(page.extract_text() or '' for page in pdf.pages)
            except Exception as e:
                logger.error(f"PDF extraction error for {filename}: {e}", exc_info=True)
                text = ""
        elif ext == '.docx':
            try:
                # Reset file pointer to beginning
                if hasattr(file_obj, 'seek'):
                    file_obj.seek(0)
                doc = Document(file_obj)
                text = "\n".join(p.text for p in doc.paragraphs)
            except Exception as e:
                logger.error(f"DOCX extraction error for {filename}: {e}", exc_info=True)
                text = ""
        elif ext == '.txt':
            try:
                # Reset file pointer to beginning
                if hasattr(file_obj, 'seek'):
                    file_obj.seek(0)
                text = file_obj.read().decode('utf-8', errors='ignore')
            except Exception as e:
                logger.error(f"TXT extraction error for {filename}: {e}", exc_info=True)
                text = ""
        return text

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        extracted_text = ""
        file_name = "unknown"
        
        if file:
            file_name = file.name
            try:
                extracted_text = self.extract_text(file, file.name)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Text extraction error: {e}", exc_info=True)
                extracted_text = ""
        
        import logging
        logger = logging.getLogger(__name__)
        if extracted_text:
            logger.info(f"Successfully extracted {len(extracted_text)} characters from {file_name}")
        else:
            logger.warning(f"No text extracted from {file_name}")

        # ✅ This line must save parsed_text into database
        # Clean file_type to avoid MIME type parameters and limit length
        file_type = None
        if file and file.content_type:
            # Take only the MIME type part (before semicolon) and limit to 255 chars
            file_type = file.content_type.split(';')[0].strip()[:255]
        
        serializer.save(
            user=self.request.user,
            file_size=file.size if file else None,
            file_type=file_type,
            parsed_text=extracted_text
        )

    def create(self, request, *args, **kwargs):
        from rest_framework import status
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Refresh serializer with saved instance to get the id
        serializer = self.get_serializer(instance=serializer.instance)
        
        headers = self.get_success_headers(serializer.data)
        return Response({
            "message": "Resume uploaded successfully.",
            "id": serializer.data.get('id'),
            "data": serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers) 





class JobDescriptionViewSet(viewsets.ModelViewSet):
    queryset = JobDescription.objects.all()
    serializer_class = JobDescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobDescription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        job = serializer.save(user=self.request.user)
        job_text = job.description or ""
        self.job_text = job_text

    def create(self, request, *args, **kwargs):
        from rest_framework import status
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Refresh serializer with saved instance to get the id
        serializer = self.get_serializer(instance=serializer.instance)
        
        headers = self.get_success_headers(serializer.data)
        return Response({
            "message": "Job description uploaded successfully.",
            "id": serializer.data.get('id'),
            "data": serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)







#it is for analysis of skills

from .nlp_module.job_resume_analyzer import analyze_gap

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_resume_job(request):
    try:
        resume_id = request.data.get('resume_id')
        job_id = request.data.get('job_id')

        if not resume_id or not job_id:
            return Response(
                {"error": "resume_id and job_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
            job = JobDescription.objects.get(id=job_id, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {"error": "Resume not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND
            )
        except JobDescription.DoesNotExist:
            return Response(
                {"error": "Job description not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND
            )

        resume_text = getattr(resume, "parsed_text", "") or ""
        job_text = getattr(job, "description", "") or ""

        if not resume_text.strip() or not job_text.strip():
            return Response(
                {"error": "Missing or empty text data in resume or job."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = analyze_gap(resume_text, job_text)

        if not result:
            return Response(
                {"error": "Analysis failed or returned no result."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save analysis result to database
        try:
            AnalysisResult.objects.create(
                user=request.user,
                resume=resume,
                job=job,
                analysis_type='gap_analysis',
                result_data=result
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error saving analysis result: {e}", exc_info=True)
            # Continue even if save fails

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in analyze_resume_job: {e}", exc_info=True)
        # Catch any unexpected issue to prevent 500s in production
        return Response(
            {"error": f"Internal server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
