from django.contrib import admin
from .models import Resume, JobDescription, UserProfile, AnalysisResult, PasswordResetToken

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'file', 'uploaded_at', 'file_size_mb', 'processing_status']
    list_filter = ['processing_status', 'uploaded_at', 'file_type']
    search_fields = ['user__username', 'file']
    readonly_fields = ['uploaded_at', 'updated_at', 'file_size_mb']
    date_hierarchy = 'uploaded_at'

@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'company', 'user', 'job_type', 'uploaded_at', 'analysis_status']
    list_filter = ['job_type', 'analysis_status', 'uploaded_at']
    search_fields = ['title', 'company', 'user__username']
    readonly_fields = ['uploaded_at', 'updated_at']
    date_hierarchy = 'uploaded_at'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'phone', 'is_verified', 'created_at', 'last_login']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'analysis_type', 'resume', 'job', 'created_at']
    list_filter = ['analysis_type', 'created_at']
    search_fields = ['user__username', 'resume__file', 'job__title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'is_used', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['user__username', 'user__email', 'token']
    readonly_fields = ['created_at']
