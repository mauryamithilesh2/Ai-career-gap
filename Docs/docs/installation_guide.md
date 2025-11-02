# Installation Guide

## Prerequisites
- Python 3.10+
- PostgreSQL
- Git

## Setup
```bash
git clone <repo-url>
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Access: http://127.0.0.1:8000/
