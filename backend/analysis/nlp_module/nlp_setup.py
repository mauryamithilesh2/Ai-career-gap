import spacy 
import subprocess
from spacy.cli import download

def get_nlp():
    try:
        nlp=spacy.load("en_core_web_sm")
    except OSError:
        subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
        nlp=spacy.load("en_core_web_sm")
    return nlp

nlp=get_nlp()