import re 
from .nlp_setup import get_nlp

nlp=get_nlp()

def analyze_resume_section(resume_text):
    doc = nlp(resume_text)

    #simple patterns

    experience_keywords=["experience", "worked", "intern", "project", "developer", "engineer"]
    education_keywords=["bachelor", "master", "university", "college", "degree", "school"]

    exp_found=any(word in resume_text.lower() for word in experience_keywords)
    edu_found=any(word in resume_text.lower() for word in education_keywords)
    

    year_exp=re.findall(r"(\d+)\+?\s+years?",resume_text.lower())
    year_exp=year_exp[0] if year_exp else "Not specified"

    return {
        "has_experirnce":exp_found,
        "has_education":edu_found,
        "year_experience":year_exp
    }