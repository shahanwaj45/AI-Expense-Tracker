import os
import logging

logger = logging.getLogger(__name__)

def scan_receipt(image_path):
    """
    Extract expense data from a receipt image using Gemini Vision.
    
    Returns: (dict | None, error_message | None)
    dict shape: { merchant, amount, date, category }
    """
    gemini_key = os.environ.get('GEMINI_API_KEY', '')
    
    if not gemini_key:
        logger.warning("No Gemini API key configured for receipt OCR")
        return None, "OCR service not configured. Please add GEMINI_API_KEY to your .env file."
    
    try:
        return _scan_with_gemini(image_path, gemini_key)
    except Exception as e:
        logger.error(f"Gemini OCR failed: {e}")
        return None, "OCR extraction failed. Please enter the expense details manually."

def _scan_with_gemini(image_path, api_key):
    """Use Gemini Vision to extract receipt data."""
    import google.generativeai as genai
    import json
    from PIL import Image
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(os.environ.get('AI_MODEL', 'gemini-1.5-flash'))
    
    image = Image.open(image_path)
    
    prompt = """Look at this receipt image and extract the following information.
Respond ONLY with valid JSON, no markdown:
{
  "merchant": "store or restaurant name",
  "amount": 250.00,
  "date": "YYYY-MM-DD or null if not found",
  "category": "Food"
}

Valid categories: Food, Travel, Education, Entertainment, Bills, Health, Shopping, Subscription, Other
If you cannot find a field, set it to null."""
    
    response = model.generate_content([prompt, image])
    text = response.text.strip()
    
    if text.startswith('```'):
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    
    parsed = json.loads(text)
    return parsed, None
