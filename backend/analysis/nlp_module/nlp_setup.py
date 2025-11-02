import spacy
import logging

logger = logging.getLogger(__name__)

def get_nlp():
    """Load spaCy English model with error handling"""
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        logger.error("spaCy model 'en_core_web_sm' not found. Please run: python -m spacy download en_core_web_sm")
        raise ImportError(
            "spaCy English model not installed. "
            "Run: python -m spacy download en_core_web_sm"
        )

# Initialize NLP model on module import
try:
    nlp = get_nlp()
except ImportError:
    nlp = None
    logger.warning("spaCy model not loaded. NLP features will not work until model is installed.")

