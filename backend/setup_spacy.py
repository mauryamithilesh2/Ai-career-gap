#!/usr/bin/env python
"""
Script to download spaCy model for deployment
Run this before starting the server in production
"""
import subprocess
import sys

def download_spacy_model():
    """Download the spaCy English model"""
    try:
        print("Downloading spaCy English model (en_core_web_sm)...")
        subprocess.check_call([
            sys.executable, "-m", "spacy", "download", "en_core_web_sm"
        ])
        print("✓ spaCy model downloaded successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error downloading spaCy model: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = download_spacy_model()
    sys.exit(0 if success else 1)

