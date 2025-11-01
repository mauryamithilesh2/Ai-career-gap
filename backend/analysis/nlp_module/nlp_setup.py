import spacy
import subprocess
import sys
from spacy.cli import download

def get_nlp():
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)
        nlp = spacy.load("en_core_web_sm")
    return nlp

nlp = get_nlp()
