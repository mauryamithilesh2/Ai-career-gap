import re 
from .nlp_setup import get_nlp, nlp
import logging

logger = logging.getLogger(__name__)

def analyze_resume_section(resume_text):
    """Analyze resume sections (experience, education, years of experience)"""
    if nlp is None:
        logger.warning("NLP model not loaded. Using basic pattern matching.")
        # Fallback to basic pattern matching
        experience_keywords = ["experience", "worked", "intern", "project", "developer", "engineer"]
        education_keywords = ["bachelor", "master", "university", "college", "degree", "school"]
        
        exp_found = any(word in resume_text.lower() for word in experience_keywords)
        edu_found = any(word in resume_text.lower() for word in education_keywords)
        year_exp = re.findall(r"(\d+)\+?\s+years?", resume_text.lower())
        year_exp = year_exp[0] if year_exp else "Not specified"
        
        return {
            "has_experience": exp_found,
            "has_education": edu_found,
            "year_experience": year_exp
        }
    
    try:
        doc = nlp(resume_text)
    except Exception as e:
        logger.warning(f"Error processing resume with NLP: {e}. Using basic pattern matching.")
        # Fallback already handled above
        pass

    # Simple patterns for keyword matching
    experience_keywords = ["experience", "worked", "intern", "project", "developer", "engineer"]
    education_keywords = ["bachelor", "master", "university", "college", "degree", "school"]

    exp_found = any(word in resume_text.lower() for word in experience_keywords)
    edu_found = any(word in resume_text.lower() for word in education_keywords)
    
    year_exp = re.findall(r"(\d+)\+?\s+years?", resume_text.lower())
    year_exp = year_exp[0] if year_exp else "Not specified"

    return {
        "has_experience": exp_found,
        "has_education": edu_found,
        "year_experience": year_exp
    }