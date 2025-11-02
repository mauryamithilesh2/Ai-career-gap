# 🧠 AI-Enhanced Career Gap Analyzer v1.0.0

### 🚀 Overview
The **AI-Enhanced Career Gap Analyzer** is a Django-based web application that helps users identify the gap between their current skills (from uploaded resumes) and the skills required for specific job roles. Future updates will include AI recommendations for learning paths.

### 🧩 Features
- 🔐 JWT Authentication (Register, Login, Logout)
- 📄 Resume Upload & Parsing
- 🏢 Job Description Upload
- 📊 Dashboard with Stats
- 🤖 Planned AI Module: Skill extraction, gap analysis, and recommendations

### 🌐 Workflow
```text
[User] --> Upload Resume --> [Resume Parser] --> [Skill Gap Analyzer] --> [Dashboard / Reports]
```

### 🛠️ Tech Stack
| Component | Technology |
|------------|-------------|
| Backend | Django REST Framework |
| Database | PostgreSQL |
| Authentication | JWT (SimpleJWT) |
| Storage | Local File Storage |
| AI/NLP | Planned with Python & Scikit-learn |
| Testing | Postman & Django Test Cases |

### ⚙️ Installation
```bash
git clone <repo-url>
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Access: http://127.0.0.1:8000/

### 🧑‍💻 Author
**Mithilesh Maurya**  
🎓 Final Year CSE Student | Full Stack Django Developer | AI Enthusiast  
