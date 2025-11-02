from .skill_extractor import extract_skills
from .recommender import recommend_learning_path
from .section_analyzer import analyze_resume_section
import logging

logger = logging.getLogger(__name__)

def analyze_gap(resume_text, job_text):
    """
    Analyze the gap between resume and job description
    
    Args:
        resume_text: Text extracted from resume
        job_text: Job description text
        
    Returns:
        Dictionary with analysis results including:
        - resume_skills: Skills found in resume
        - job_skills: Skills required by job
        - missing_skills: Skills in job but not in resume
        - match_percent: Percentage match score
        - recommendations: Learning recommendations
        - resume_overview: Resume section analysis
    """
    try:
        resume_skills = extract_skills(resume_text) or []
        job_skills = extract_skills(job_text) or []

        # Calculate missing skills (case-insensitive comparison)
        resume_skills_lower = [s.lower() for s in resume_skills]
        missing_skills = [s for s in job_skills if s.lower() not in resume_skills_lower]

        # Calculate match percentage
        total = len(job_skills) if job_skills else 1
        match_percent = round(100 * (len(job_skills) - len(missing_skills)) / total, 2)

        # Generate recommendations
        recommendations = recommend_learning_path(missing_skills)
        
        # Analyze resume sections
        resume_info = analyze_resume_section(resume_text)

        return {
            "resume_skills": resume_skills,
            "job_skills": job_skills,
            "missing_skills": missing_skills,
            "match_percent": match_percent,
            "recommendations": recommendations,
            "resume_overview": resume_info
        }
    except Exception as e:
        logger.error(f"Error in gap analysis: {e}", exc_info=True)
        # Return empty result on error
        return {
            "resume_skills": [],
            "job_skills": [],
            "missing_skills": [],
            "match_percent": 0.0,
            "recommendations": ["Analysis failed. Please try again."],
            "resume_overview": {
                "has_experience": False,
                "has_education": False,
                "year_experience": "Not specified"
            }
        }