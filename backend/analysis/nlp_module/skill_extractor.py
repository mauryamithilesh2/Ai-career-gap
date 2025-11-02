from .nlp_setup import get_nlp, nlp
from spacy.matcher import PhraseMatcher
import logging

logger = logging.getLogger(__name__)

# Skill list - can be extended or moved to database
# Note: This is a basic list. Consider expanding or using a database for production.

SKILL_LIST = [
    "python", "django", "react", "javascript", "sql",
    "machine learning", "data analysis", "nlp", "communication",
    "flask", "html", "css", "node.js", "typescript", "java",
    "spring", "aws", "docker", "kubernetes", "git", "mongodb",
    "mysql", "postgresql", "api", "rest", "graphql", "agile",
    "scrum", "testing", "ci/cd", "devops", "linux", "ubuntu"
]

def extract_skills(text: str):
    """Extract skills from text using spaCy phrase matching"""
    if not text:
        return []
    
    if nlp is None:
        logger.warning("NLP model not loaded. Cannot extract skills. Using basic pattern matching.")
        # Fallback: basic keyword matching
        text_lower = text.lower()
        found = [skill for skill in SKILL_LIST if skill.lower() in text_lower]
        return found
    
    try:
        doc = nlp(text.lower())
        matcher = PhraseMatcher(nlp.vocab)
        patterns = [nlp.make_doc(skill) for skill in SKILL_LIST]
        matcher.add("SKILLS", patterns)
        matches = matcher(doc)
        found = list({doc[start:end].text for _, start, end in matches})
        return found
    except Exception as e:
        logger.error(f"Error extracting skills: {e}", exc_info=True)
        # Fallback: basic keyword matching
        text_lower = text.lower()
        found = [skill for skill in SKILL_LIST if skill.lower() in text_lower]
        return found
   