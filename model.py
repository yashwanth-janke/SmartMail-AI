"""
AI Model Integration for Email Rewriting
Supports multiple AI backends: Hugging Face API, local models, or mock data
"""

import os
import requests
import json
from typing import Optional

# Configuration
USE_HUGGINGFACE_API = False  # Set to True to use Hugging Face API
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')  # Set your API key in environment
HUGGINGFACE_MODEL = "facebook/bart-large-cnn"  # You can change this to other models


def rewrite_with_huggingface(text: str, tone: str) -> str:
    """
    Rewrite email using Hugging Face Inference API
    """
    if not HUGGINGFACE_API_KEY:
        raise ValueError("Hugging Face API key not found. Set HUGGINGFACE_API_KEY environment variable.")
    
    API_URL = f"https://api-inference.huggingface.co/models/{HUGGINGFACE_MODEL}"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    # Create a prompt that includes the tone
    prompt = f"Rewrite the following email in a {tone} tone:\n\n{text}"
    
    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": prompt},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', text)
            return text
        else:
            print(f"Hugging Face API Error: {response.status_code}")
            return rewrite_with_mock(text, tone)
    
    except Exception as e:
        print(f"Error calling Hugging Face API: {str(e)}")
        return rewrite_with_mock(text, tone)


def rewrite_with_mock(text: str, tone: str) -> str:
    """
    Mock rewriter for development/testing without API
    Applies simple text transformations based on tone
    """
    
    # Tone-specific templates and modifications
    tone_templates = {
        'formal': {
            'greeting': 'Dear Sir/Madam,',
            'closing': 'Respectfully yours,',
            'style': 'professional and structured'
        },
        'professional': {
            'greeting': 'Hello,',
            'closing': 'Best regards,',
            'style': 'clear and business-appropriate'
        },
        'casual': {
            'greeting': 'Hey there!',
            'closing': 'Cheers!',
            'style': 'friendly and relaxed'
        },
        'friendly': {
            'greeting': 'Hi!',
            'closing': 'Take care!',
            'style': 'warm and approachable'
        },
        'persuasive': {
            'greeting': 'Hello,',
            'closing': 'Looking forward to your response,',
            'style': 'compelling and action-oriented'
        },
        'empathetic': {
            'greeting': 'Dear friend,',
            'closing': 'With understanding and support,',
            'style': 'compassionate and considerate'
        },
        'concise': {
            'greeting': 'Hi,',
            'closing': 'Thanks,',
            'style': 'brief and to-the-point'
        },
        'apologetic': {
            'greeting': 'Dear recipient,',
            'closing': 'Sincerely apologetic,',
            'style': 'regretful and understanding'
        }
    }
    
    # Get tone template (default to professional)
    template = tone_templates.get(tone.lower(), tone_templates['professional'])
    
    # Simple rewriting logic
    lines = text.strip().split('\n')
    rewritten_lines = []
    
    # Add appropriate greeting if not present
    first_line = lines[0].lower()
    if not any(greet in first_line for greet in ['hi', 'hello', 'dear', 'hey']):
        rewritten_lines.append(template['greeting'])
        rewritten_lines.append('')
    
    # Process content based on tone
    for line in lines:
        if line.strip():
            processed_line = apply_tone_modifications(line, tone)
            rewritten_lines.append(processed_line)
        else:
            rewritten_lines.append(line)
    
    # Add appropriate closing
    rewritten_lines.append('')
    rewritten_lines.append(template['closing'])
    
    # Add a note about the rewrite
    result = '\n'.join(rewritten_lines)
    result += f"\n\n[✨ Rewritten in {tone} tone - This email has been polished to be {template['style']}]"
    
    return result


def apply_tone_modifications(text: str, tone: str) -> str:
    """
    Apply tone-specific modifications to text
    """
    
    if tone.lower() == 'formal':
        # Make more formal
        text = text.replace("I'm", "I am")
        text = text.replace("don't", "do not")
        text = text.replace("can't", "cannot")
        text = text.replace("won't", "will not")
        text = text.replace("isn't", "is not")
        text = text.replace("thanks", "thank you")
        text = text.replace("Thanks", "Thank you")
    
    elif tone.lower() == 'casual':
        # Make more casual
        text = text.replace("I am writing to", "I wanted to")
        text = text.replace("I would like to", "I'd like to")
        text = text.replace("Thank you very much", "Thanks a lot")
    
    elif tone.lower() == 'persuasive':
        # Add persuasive elements
        if not any(word in text.lower() for word in ['consider', 'opportunity', 'benefit', 'value']):
            text = "I believe " + text
    
    elif tone.lower() == 'empathetic':
        # Add empathetic phrases
        if not any(word in text.lower() for word in ['understand', 'appreciate', 'recognize']):
            text = "I understand that " + text.lower()
    
    elif tone.lower() == 'concise':
        # Remove filler words
        filler_words = ['very', 'really', 'just', 'actually', 'basically']
        for filler in filler_words:
            text = text.replace(f" {filler} ", " ")
    
    return text


def rewrite_email(text: str, tone: str = 'professional') -> str:
    """
    Main function to rewrite email based on tone
    Automatically selects the best available backend
    
    Args:
        text: Original email text
        tone: Desired tone (formal, casual, professional, friendly, etc.)
    
    Returns:
        Rewritten email text
    """
    
    # Validate inputs
    if not text or not text.strip():
        raise ValueError("Email text cannot be empty")
    
    if len(text.strip()) < 10:
        raise ValueError("Email text is too short")
    
    # Choose backend
    if USE_HUGGINGFACE_API and HUGGINGFACE_API_KEY:
        try:
            return rewrite_with_huggingface(text, tone)
        except Exception as e:
            print(f"Hugging Face API failed, falling back to mock: {str(e)}")
            return rewrite_with_mock(text, tone)
    else:
        return rewrite_with_mock(text, tone)


# Test function
if __name__ == "__main__":
    test_email = """
    Hi,
    I wanted to ask if you can send me the report by tomorrow.
    Thanks
    """
    
    tones = ['formal', 'professional', 'casual', 'friendly', 'persuasive']
    
    print("🧪 Testing Email Rewriter\n")
    print(f"Original Email:\n{test_email}\n")
    print("=" * 60)
    
    for tone in tones:
        print(f"\n{tone.upper()} TONE:")
        print("-" * 60)
        result = rewrite_email(test_email, tone)
        print(result)
        print("-" * 60)
