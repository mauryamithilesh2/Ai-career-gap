from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Before: Basic models with minimal fields
# class Resume(models.Model):
#     user = models.ForeignKey(User,on_delete=models.CASCADE)
#     file=models.FileField(upload_to='resumes/')
#     parsed_text=models.TextField(blank=True,null=True)
#     uploaded_at=models.DateTimeField(auto_now_add=True)

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    parsed_text = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    file_type = models.CharField(max_length=255, blank=True, null=True)
    is_processed = models.BooleanField(default=False)
    processing_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], default='pending')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.user.username} - {self.file.name}"
    
    @property
    def file_size_mb(self):
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0


class JobDescription(models.Model):
    JOB_TYPE_CHOICES = [
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_descriptions', null=True, blank=True)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full-time')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_analyzed = models.BooleanField(default=False)
    analysis_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('analyzing', 'Analyzing'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], default='pending')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} - {self.company or 'Unknown Company'}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    # avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)  # Temporarily disabled
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class AnalysisResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analysis_results')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='analysis_results', null=True, blank=True)
    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='analysis_results', null=True, blank=True)
    analysis_type = models.CharField(max_length=20, choices=[
        ('resume_analysis', 'Resume Analysis'),
        ('job_matching', 'Job Matching'),
        ('gap_analysis', 'Gap Analysis'),
    ])
    result_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.analysis_type}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Reset token for {self.user.username}"