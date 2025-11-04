from .nlp_setup import get_nlp, nlp
from spacy.matcher import PhraseMatcher
import logging

logger = logging.getLogger(__name__)

# =========================================================
# ✅ Master Skill List – Technical + Non-Technical
# =========================================================
SKILL_LIST = [
    # --- Technical Skills ---
    "python", "django", "flask", "fastapi", "react", "javascript", "typescript",
    "node.js", "express", "next.js", "java", "spring", "c++", "c#", "go", "rust",
    "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "git", "github", "gitlab", "bitbucket", "ci/cd",
    "html", "css", "sass", "tailwind", "bootstrap",
    "machine learning", "deep learning", "nlp", "data analysis",
    "computer vision", "pandas", "numpy", "tensorflow", "pytorch",
    "scikit-learn", "matplotlib", "power bi", "tableau",
    "linux", "ubuntu", "bash", "shell scripting",
    "rest", "graphql", "api development", "microservices",
    "testing", "unit testing", "selenium", "pytest", "postman",
    "cybersecurity", "networking", "cloud computing", "devops",
    "data engineering", "big data", "hadoop", "spark",
    "etl", "data visualization", "blockchain", "web3",
    "flutter", "kotlin", "swift",

    # --- Non-Technical / Soft Skills ---
    "communication", "leadership", "teamwork", "problem solving",
    "time management", "adaptability", "creativity", "critical thinking",
    "attention to detail", "collaboration", "decision making",
    "negotiation", "emotional intelligence", "work ethic",
    "conflict resolution", "project management", "mentoring",
    "presentation", "organization", "self motivation",
    "analytical thinking", "strategic planning", "customer focus",
    "multi-tasking", "innovation", "responsibility", "accountability",
    "interpersonal skills", "flexibility", "initiative"
]

# =========================================================
# ✅ Initialize Matcher Once (for Performance)
# =========================================================
matcher = None
if nlp:
    try:
        matcher = PhraseMatcher(nlp.vocab)
        patterns = [nlp.make_doc(skill) for skill in SKILL_LIST]
        matcher.add("SKILLS", patterns)
        logger.info("PhraseMatcher initialized successfully with skills.")
    except Exception as e:
        logger.error(f"Error initializing PhraseMatcher: {e}", exc_info=True)
        matcher = None


# Skill Extraction Function
def extract_skills(text: str):
    """Extract skills from text using spaCy phrase matching."""
    if not text:
        return []

    # Normalize text (lowercase + remove extra spaces)
    text = " ".join(text.split()).lower()

    if nlp is None or matcher is None:
        logger.warning("NLP model or matcher not loaded. Using basic keyword matching.")
        return [skill for skill in SKILL_LIST if skill.lower() in text]

    try:
        doc = nlp(text)
        matches = matcher(doc)
        found = list({doc[start:end].text for _, start, end in matches})
        # Return cleaned and capitalized results
        return sorted([skill.title() for skill in found])
    except Exception as e:
        logger.error(f"Error extracting skills: {e}", exc_info=True)
        return [skill for skill in SKILL_LIST if skill.lower() in text]
