import os
import logging
from app.services.ai_service import parse_voice_expense

logger = logging.getLogger(__name__)

def process_voice_text(text):
    """
    Parse voice transcription text into structured expense data.
    The browser handles speech-to-text; we just parse the resulting text.
    """
    if not text or not text.strip():
        return None, "No text received. Please try speaking again."
    
    return parse_voice_expense(text.strip())
