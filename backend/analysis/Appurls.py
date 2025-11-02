from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ResumeViewSet, JobDescriptionViewSet, home, api_root, RegisterView, 
    api_info,
    LoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView,
    ChangePasswordView, UserProfileView, DashboardStatsView,analyze_resume_job
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Custom router that uses our public API root view
class CustomDefaultRouter(DefaultRouter):
    def get_api_root_view(self, api_urls=None):
        """
        Return a view to use as the API root.
        Override to use our custom api_root view that doesn't require auth
        """
        return api_root

router = CustomDefaultRouter()
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
    path('api/analyze/',analyze_resume_job,name='analyze_resume_job')
]


