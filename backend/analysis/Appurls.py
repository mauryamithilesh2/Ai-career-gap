from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ResumeViewSet, JobDescriptionViewSet, home, RegisterView, ResumeUploadView,
    LoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView,
    ChangePasswordView, UserProfileView, DashboardStatsView, JobUploadView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'jobs', JobDescriptionViewSet, basename='job')

urlpatterns = [
    # Home endpoint
    path('',home, name='home'),
    
    path('api/resumes/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('api/jobs/upload/', JobUploadView.as_view(), name='job-upload'),
    
    # API routes via router
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
    
    # File uploads
    # JWT token endpoints (keeping for compatibility)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


