from .nlp_setup import get_nlp
from spacy.matcher import PhraseMatcher

nlp=get_nlp()


# basic skill list-> it can be extend bad me ............

SKILL_LIST=[
    "python", "django", "react", "javascript", "sql",
    "machine learning", "data analysis", "nlp", "communication",
    "flask", "html", "css"
]

def extract_skills(text: str):
    if not text:
        return []
    
    doc = nlp(text.lower())
    matcher = PhraseMatcher(nlp.vocab)
    patterns = [nlp.make_doc(skill) for skill in SKILL_LIST]
    matcher.add("SKILLS", patterns)
    matches = matcher(doc)
    found = list({doc[start:end].text for _, start, end in matches})
    return found
   