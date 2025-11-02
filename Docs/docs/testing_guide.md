<!-- # Testing Guide

## Manual Testing
Use Postman:
1. Register `/api/register/`
2. Login `/api/login/`
3. Copy JWT token
4. Upload resume `/api/resumes/upload/`
5. Check dashboard `/api/dashboard/`

## Automated Testing
```python
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class ResumeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test', password='test123')
        self.client.login(username='test', password='test123')

    def test_upload_resume(self):
        with open('test_resume.pdf', 'rb') as file:
            response = self.client.post('/api/resumes/upload/', {'file': file})
        self.assertEqual(response.status_code, 201)
``` -->