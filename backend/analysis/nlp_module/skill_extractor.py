from .nlp_setup import get_nlp

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
    found=[]
    for token in doc :
        if token.text in SKILL_LIST:
            found.append(token.text)

# check for multi-word  skills  like n-grams
    for phrase in SKILL_LIST:
        if " " in phrase and phrase in text.lower():
            found.append(phrase)

    return list(set(found))            