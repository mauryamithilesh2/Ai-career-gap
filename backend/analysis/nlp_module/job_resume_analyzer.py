from .skill_extractor import extract_skills
from .recommender import recommend_learning_path
from .section_analyzer import analyze_resume_section
def analyze_gap(resume_text,job_text):
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_text)

    missing_skills=[s for s in job_skills if s not in resume_skills]

    total = len(job_skills) if job_skills else 1
    
    match_percent = round(100* (len(job_skills)-len(missing_skills))/total,2)

    recommendations = recommend_learning_path(missing_skills)
    resume_info = analyze_resume_section(resume_text)

    return {
        "resume_skills":resume_skills,
        "job_skills":job_skills,
        "missing_skills":missing_skills,
        "match_percent":match_percent,
        "recommendations": recommendations,
        "resume_overview": resume_info
    }