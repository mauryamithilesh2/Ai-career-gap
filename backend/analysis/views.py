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
        from django.utils import timezone
        from datetime import timedelta
        import json
        
        user = request.user
        
        # Calculate stats
        total_resumes = Resume.objects.filter(user=user).count()
        total_jobs = JobDescription.objects.filter(user=user).count()
        total_analyses = AnalysisResult.objects.filter(user=user).count()
        
        # Calculate match accuracy from analysis results
        match_accuracy = 0.0
        if total_analyses > 0:
            import logging
            logger = logging.getLogger(__name__)
            analyses = AnalysisResult.objects.filter(user=user)
            total_match_score = 0
            count_with_score = 0
            
            for analysis in analyses:
                result_data = analysis.result_data
                if isinstance(result_data, dict):
                    # Try to extract match score from different possible keys
                    # Note: analyze_gap returns 'match_percent' (not 'match_percentage')
                    match_score = (
                        result_data.get('match_percent') or  # Primary key from analyze_gap
                        result_data.get('match_percentage') or
                        result_data.get('match_score') or
                        result_data.get('overall_match') or
                        result_data.get('match_accuracy') or
                        result_data.get('score')
                    )
                    if match_score is not None:
                        try:
                            score = float(match_score)
                            if 0 <= score <= 100:
                                total_match_score += score
                                count_with_score += 1
                        except (ValueError, TypeError):
                            logger.warning(f"Invalid match score format: {match_score}")
                            pass
                    else:
                        # Log if no match score found
                        logger.debug(f"No match score found in analysis {analysis.id}. Keys: {list(result_data.keys())}")
            
            if count_with_score > 0:
                match_accuracy = round(total_match_score / count_with_score, 1)
                logger.info(f"Calculated match accuracy: {match_accuracy}% from {count_with_score} analyses")
            else:
                # Default to 0 if no scores found
                match_accuracy = 0.0
                logger.warning(f"No match scores found in {total_analyses} analyses")
        
        # Calculate average analysis time
        # Since analysis is done synchronously, we can't measure actual processing time
        # Instead, we'll use a reasonable estimate or calculate from a different metric
        avg_analysis_time = 0.0
        if total_analyses > 0:
            # For now, estimate based on analysis complexity
            # You could also store actual processing time when analysis is performed
            analyses = AnalysisResult.objects.filter(user=user)
            total_time_seconds = 0
            count_with_time = 0
            
            for analysis in analyses:
                # Calculate time difference between created_at and updated_at
                # This might be very small if analysis is fast, so we use a minimum
                if analysis.created_at and analysis.updated_at:
                    time_diff = (analysis.updated_at - analysis.created_at).total_seconds()
                    # If time difference is too small (less than 0.1s), use estimated time
                    # based on result_data complexity
                    if time_diff < 0.1:
                        result_data = analysis.result_data
                        if isinstance(result_data, dict):
                            # Estimate: 1-3 seconds based on data complexity
                            skills_count = len(result_data.get('resume_skills', [])) + len(result_data.get('job_skills', []))
                            estimated_time = min(3.0, max(1.0, skills_count * 0.1))
                            total_time_seconds += estimated_time
                            count_with_time += 1
                    else:
                        total_time_seconds += time_diff
                        count_with_time += 1
            
            if count_with_time > 0:
                avg_analysis_time = round(total_time_seconds / count_with_time, 1)
            else:
                # Default estimate if no time data
                avg_analysis_time = 2.0
        
        # Recent activities
        recent_activities = []
        
        # Recent resumes (ordered by most recent)
        recent_resumes = Resume.objects.filter(user=user).order_by('-uploaded_at')[:5]
        for resume in recent_resumes:
            file_name = resume.file_name or 'Untitled Resume'
            recent_activities.append({
                'type': 'resume',
                'title': file_name,
                'time': resume.uploaded_at.isoformat() if resume.uploaded_at else timezone.now().isoformat(),
                'status': resume.processing_status or 'pending',
                'icon': '📄'
            })
        
        # Recent jobs (ordered by most recent)
        recent_jobs = JobDescription.objects.filter(user=user).order_by('-uploaded_at')[:5]
        for job in recent_jobs:
            recent_activities.append({
                'type': 'job',
                'title': job.title or 'Untitled Job',
                'time': job.uploaded_at.isoformat() if job.uploaded_at else timezone.now().isoformat(),
                'status': job.analysis_status or 'pending',
                'icon': '💼'
            })
        
        # Recent analyses (ordered by most recent)
        recent_analyses = AnalysisResult.objects.filter(user=user).order_by('-created_at')[:5]
        for analysis in recent_analyses:
            analysis_title = f"{analysis.analysis_type.replace('_', ' ').title()}"
            if analysis.resume:
                analysis_title += f" - {analysis.resume.file_name or 'Resume'}"
            if analysis.job:
                analysis_title += f" vs {analysis.job.title or 'Job'}"
            
            recent_activities.append({
                'type': 'analysis',
                'title': analysis_title,
                'time': analysis.created_at.isoformat() if analysis.created_at else timezone.now().isoformat(),
                'status': 'completed',
                'icon': '📊'
            })
        
        # Sort by time (most recent first)
        recent_activities.sort(key=lambda x: x['time'], reverse=True)
        recent_activities = recent_activities[:10]  # Show top 10 most recent
        
        stats = {
            'total_resumes': total_resumes,
            'total_jobs': total_jobs,
            'total_analyses': total_analyses,
            'recent_activities': recent_activities,
            'match_accuracy': match_accuracy,
            'avg_analysis_time': avg_analysis_time
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)



from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
import pdfplumber
from docx import Document
import io
import os
import logging

logger = logging.getLogger(__name__)
class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by('-uploaded_at')[:1]

    def extract_text(self, file_bytes, filename):
        """Extract text from in-memory file bytes (handles scanned PDFs safely)."""

        logger = logging.getLogger(__name__)
        ext = os.path.splitext(filename)[1].lower()
        text = ""

        try:
            if ext == '.pdf':
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    extracted_pages = []
                    for i, page in enumerate(pdf.pages):
                        page_text = page.extract_text()
                        if page_text:
                            extracted_pages.append(page_text)
                        else:
                            logger.warning(f"⚠️ No text found on page {i+1} of {filename}.")
                    text = "\n".join(extracted_pages)

            elif ext == '.docx':
                doc = Document(io.BytesIO(file_bytes))
                text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())

            elif ext == '.txt':
                text = file_bytes.decode('utf-8', errors='ignore')

        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {e}", exc_info=True)
            text = ""

        # Final check: handle empty result gracefully
        if not text.strip():
            logger.warning(f"⚠️ No extractable text found in file: {filename}")
            text = ""

        return text

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        extracted_text = ""
        file_name = "unknown"
        file_type = None
        file_size = None
        file_data = None

        if file:
            file_name = file.name
            file_type = file.content_type.split(';')[0].strip()[:255]
            file_size = file.size
            file_data = file.read()  # ✅ Read full binary data into memory (for DB blob)

            # Extract text directly from in-memory bytes
            extracted_text = self.extract_text(file_data, file_name)

        if extracted_text:
            logger.info(f"Successfully extracted {len(extracted_text)} characters from {file_name}")
        else:
            logger.warning(f"No text extracted from {file_name}")

        # Save everything, storing binary file content in DB
        serializer.save(
            user=self.request.user,
            parsed_text=extracted_text,
            file_size=file_size,
            file_type=file_type,
            file=file_data,
            file_name=file_name, # ✅ store as blob (not FileField)
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
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






#Create a new Django view for Google login 
import requests

from django.shortcuts import redirect
from rest_framework.decorators import api_view
from django.conf import settings
import urllib.parse

from django.shortcuts import redirect

from django.contrib.auth.models import User




@api_view(['GET'])
@permission_classes([AllowAny])  
def google_login(request):
    print("GOOGLE_CLIENT_ID:", settings.GOOGLE_CLIENT_ID)
    print("GOOGLE_REDIRECT_URI:", settings.GOOGLE_REDIRECT_URI)

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return redirect(google_auth_url)

@api_view(['GET'])
@permission_classes([AllowAny])
def google_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error == "access_denied" or not code:
        return redirect(f"{settings.FRONTEND_URL}/login?error=google_failed")

    #  If we have a code, continue normal OAuth
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    r = requests.post(token_url, data=data)
    tokens = r.json()
    access_token = tokens.get("access_token")

    if not access_token:
        return redirect(f"{settings.FRONTEND_URL}/login?error=token_failed")

    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    email = user_info.get("email")
    name = user_info.get("name", "")
    given_name = user_info.get("given_name", "")
    family_name = user_info.get("family_name", "")

    if not email:
        return redirect(f"{settings.FRONTEND_URL}/login?error=no_email")

    # Get or create user
    user, created = User.objects.get_or_create(
        username=email.split("@")[0],
        defaults={
            "first_name": given_name or name.split(" ")[0] if name else "",
            "last_name": family_name or "",
            "email": email,
        },
    )
    
    # Update user info if user already exists (to sync with Google profile)
    if not created:
        user.first_name = given_name or name.split(" ")[0] if name else user.first_name or ""
        user.last_name = family_name or user.last_name or ""
        user.email = email
        user.save()
    
    # Ensure UserProfile exists
    from .models import UserProfile
    UserProfile.objects.get_or_create(user=user)

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # ✅ Make sure tokens are stringified before sending
    access = str(access)
    refresh = str(refresh)

    # 🟩 Send tokens to frontend
    redirect_url = (
        f"{settings.FRONTEND_URL}/google-success?"
        f"access={access}&refresh={refresh}"
    )
    return redirect(redirect_url)






# resume generation views 
import openai
from .serializers import ResumeInputSerializer

openai.api_key= settings.OPENAI_API_KEY
class GenerateResumeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResumeInputSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            projects = ", ".join(data.get('projects', []))
            achievements = ", ".join(data.get('achievements', []))

            prompt = f"""
            Rewrite the following resume details in a professional, ATS-friendly format:
            Name: {data.get('name', 'N/A')}
            Role: {data.get('role', 'N/A')}
            Education: {data.get('education', 'N/A')}
            Skills: {data.get('skills', 'N/A')}
            Projects: {projects}
            Internship: {data.get('internship', 'None')}
            Achievements: {achievements}

            Return structured text as sections with headings like Name, Role, Education, Skills, Projects, Internship, Achievements
            1. Professional Summary (3 lines)
            2. Skills (formatted list)
            3. Projects (each as bullet points with outcome-based description)
            4. Experience (if available)
            5. Education
            6. Achievements (if available)
                        """

            try:
                response = openai.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000,
                    temperature=0.4
                )
                formatted_resume = response.choices[0].message.content.strip()
                return Response({"formatted_resume": formatted_resume}, status=200)
            except Exception as e:
                print("OpenAI API Error:", e)
                return Response({"detail": "Failed to generate resume. Check server logs."}, status=500)

        return Response(serializer.errors, status=400)





# import wisper
from openai import OpenAI
import json
import re

# Initialize OpenAI client with API key validation
if not settings.OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set in settings")

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# model_whisper=wisper.load_model("base")

class AnalyzeSpeech(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            audio_file = request.FILES.get("audio")
            if not audio_file:
                return Response({"error": "No audio file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Ensure the file is at the beginning
            audio_file.seek(0)
            
            # ✅ Speech → Text (using OpenAI Whisper cloud model)
            try:
                # The Whisper API accepts the file directly
                # Pass as tuple: (filename, file_object, content_type)
                file_name = audio_file.name or "audio.webm"
                file_content = audio_file.read()
                content_type = audio_file.content_type or "audio/webm"
                
                # Reset file pointer after reading
                audio_file.seek(0)
                
                # Create file tuple for OpenAI API
                file_tuple = (file_name, file_content, content_type)
                
                transcript_response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=file_tuple
                )
                
                # Extract transcript text
                transcript = transcript_response.text
            except Exception as whisper_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Whisper API error: {whisper_error}", exc_info=True)
                return Response(
                    {"error": f"Failed to transcribe audio: {str(whisper_error)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Check if transcript is empty
            if not transcript or not transcript.strip():
                return Response(
                    {"error": "No speech detected in the audio file. Please ensure the audio contains speech."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Analyze speech using openai
            prompt = f"""
            Analyze this speech text for communication quality:

            "{transcript}"

            Return a JSON object with the following structure:
            {{
                "clarity": <score out of 10>,
                "confidence": <score out of 10>,
                "fluency": <score out of 10>,
                "feedback": "<short improvement feedback>"
            }}

            Only return the JSON object, no additional text.
            """

            try:
                gpt_response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}
                )
                analysis_text = gpt_response.choices[0].message.content
            except Exception as gpt_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"GPT API error: {gpt_error}", exc_info=True)
                return Response(
                    {"error": f"Failed to analyze speech: {str(gpt_error)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Parse the JSON response
            try:
                analysis_data = json.loads(analysis_text)
            except json.JSONDecodeError as json_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"JSON decode error, using fallback parser: {json_error}")
                # Fallback: try to extract scores from text if JSON parsing fails
                analysis_data = self._parse_analysis_text(analysis_text)

            return Response({
                "transcript": transcript,
                "clarity": analysis_data.get("clarity", 0),
                "confidence": analysis_data.get("confidence", 0),
                "fluency": analysis_data.get("fluency", 0),
                "feedback": analysis_data.get("feedback", "Unable to analyze speech.")
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            error_trace = traceback.format_exc()
            logger.error(f"Error in AnalyzeSpeech: {e}\n{error_trace}", exc_info=True)
            return Response(
                {
                    "error": "Failed to analyze speech. Please try again.",
                    "detail": str(e) if settings.DEBUG else None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _parse_analysis_text(self, text):
        """Fallback method to extract scores from text if JSON parsing fails"""
        result = {
            "clarity": 0,
            "confidence": 0,
            "fluency": 0,
            "feedback": text
        }
        
        # Try to extract scores using regex
        clarity_match = re.search(r'clarity[:\s]+(\d+)', text, re.IGNORECASE)
        confidence_match = re.search(r'confidence[:\s]+(\d+)', text, re.IGNORECASE)
        fluency_match = re.search(r'fluency[:\s]+(\d+)', text, re.IGNORECASE)
        
        if clarity_match:
            result["clarity"] = int(clarity_match.group(1))
        if confidence_match:
            result["confidence"] = int(confidence_match.group(1))
        if fluency_match:
            result["fluency"] = int(fluency_match.group(1))
        
        return result
