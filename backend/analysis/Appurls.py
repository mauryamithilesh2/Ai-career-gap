from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ResumeViewSet, JobDescriptionViewSet, home, api_root, RegisterView, 
    api_info,
    LoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView,
    ChangePasswordView, UserProfileView, DashboardStatsView,analyze_resume_job,
    google_login,google_callback,GenerateResumeAPIView,AnalyzeSpeech
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router =DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'jobs', JobDescriptionViewSet, basename='job')

urlpatterns = [
    # Home endpoint
    path('',home, name='home'),
    
    # API routes via router (resumes, jobs)
    # The router uses our custom api_root view (accessible without auth) at /api/
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    
    # Password management
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # User profile
    path('api/auth/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Dashboard
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # API info (static json)
    path('api/info/', api_info, name='api-info'),
    
    # File uploads
    # JWT token endpoints (keeping for compatibility)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    #analysis result
    path('api/analyze/',analyze_resume_job,name='analyze_resume_job'),


    path("api/auth/google/login/",google_login, name="google_login"),
    path("api/auth/google/callback/", google_callback, name="google_callback"),
    path("api/generate-resume/",GenerateResumeAPIView.as_view(),name="generate_resume"),
    path("api/speak-assessment/",AnalyzeSpeech.as_view(),name="speak_assessment"),
]


