"""
AI Model Integration for Email Rewriting
Supports Groq API, Hugging Face API, or mock data
"""

import os
import requests
import json
from typing import Optional

# Configuration
USE_GROQ_API = True  # Set to True to use Groq API (Recommended)
USE_HUGGINGFACE_API = False  # Set to True to use Hugging Face API
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')  # Set your Groq API key
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')  # Set your API key in environment
HUGGINGFACE_MODEL = "facebook/bart-large-cnn"  # You can change this to other models


def rewrite_with_groq(text: str, tone: str, mode: str = 'rewrite') -> str:
    """
    Rewrite or generate email using Groq API (Fast and Free!)
    
    Args:
        text: Email content or description
        tone: Desired tone
        mode: 'write' or 'rewrite'
    
    Returns:
        Generated/rewritten email
    """
    if not GROQ_API_KEY:
        raise ValueError("Groq API key not found. Set GROQ_API_KEY environment variable.")
    
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Create appropriate prompt based on mode
    if mode == 'write':
        system_prompt = f"""You are an expert email writer. Generate a professional, well-structured email based on the user's description.
The email should be in a {tone} tone. Make it natural, appropriate, and ready to send.
Include proper greeting, body, and closing. Do not add subject line."""
        user_prompt = f"Generate an email with the following details:\n\n{text}"
    else:
        system_prompt = f"""You are an expert email editor. Rewrite the given email to make it better.
Apply a {tone} tone while preserving the original meaning and intent.
Improve clarity, professionalism, and impact. Keep the same structure but enhance the language."""
        user_prompt = f"Rewrite this email in a {tone} tone:\n\n{text}"
    
    payload = {
        "model": "mixtral-8x7b-32768",  # Fast and capable model
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
        "top_p": 1,
        "stream": False
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'choices' in result and len(result['choices']) > 0:
                generated_text = result['choices'][0]['message']['content'].strip()
                return generated_text
            else:
                raise Exception("No response from Groq API")
        else:
            error_msg = f"Groq API Error: {response.status_code}"
            if response.text:
                error_msg += f" - {response.text}"
            print(error_msg)
            raise Exception(error_msg)
    
    except requests.exceptions.Timeout:
        raise Exception("Groq API timeout. Please try again.")
    except requests.exceptions.RequestException as e:
        print(f"Error calling Groq API: {str(e)}")
        raise Exception(f"Network error: {str(e)}")
    except Exception as e:
        print(f"Groq API error: {str(e)}")
        raise Exception(str(e))


def rewrite_with_huggingface(text: str, tone: str, mode: str = 'rewrite') -> str:
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


def rewrite_with_mock(text: str, tone: str, mode: str = 'rewrite') -> str:
    """
    Mock rewriter/writer for development/testing without API
    Applies simple text transformations based on tone and mode
    
    Args:
        text: Input text (email to rewrite or description for new email)
        tone: Desired tone
        mode: 'write' or 'rewrite'
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
    
    # Handle write mode differently
    if mode == 'write':
        return generate_new_email(text, tone, template)
    else:
        return rewrite_existing_email(text, tone, template)


def generate_new_email(description: str, tone: str, template: dict) -> str:
    """
    Generate a new email from a description
    """
    lines = []
    
    # Add greeting
    lines.append(template['greeting'])
    lines.append('')
    
    # Process the description and create email body
    desc_lower = description.lower()
    
    # Detect intent and generate appropriate content
    if 'meeting' in desc_lower or 'schedule' in desc_lower:
        if tone in ['formal', 'professional']:
            lines.append('I hope this email finds you well.')
            lines.append('')
            lines.append('I am writing to request a meeting to discuss the matters outlined below. '
                        'Would you be available for a discussion at your earliest convenience?')
        else:
            lines.append('I wanted to reach out and see if we could schedule some time to chat.')
        lines.append('')
        lines.append(f'Regarding: {description}')
        
    elif 'thank' in desc_lower or 'appreciate' in desc_lower:
        lines.append('I wanted to take a moment to express my sincere gratitude.')
        lines.append('')
        lines.append(description)
        lines.append('')
        lines.append('Your support has been invaluable.')
        
    elif 'follow' in desc_lower or 'update' in desc_lower:
        lines.append('I am writing to follow up on our previous correspondence.')
        lines.append('')
        lines.append(description)
        lines.append('')
        lines.append('I would appreciate any updates you can provide on this matter.')
        
    elif 'sorry' in desc_lower or 'apolog' in desc_lower:
        lines.append('I am writing to sincerely apologize.')
        lines.append('')
        lines.append(description)
        lines.append('')
        lines.append('I take full responsibility and will ensure this does not happen again.')
        
    else:
        # Generic email generation
        if tone in ['formal', 'professional']:
            lines.append('I hope this message finds you well.')
            lines.append('')
        
        lines.append(description)
        lines.append('')
        
        if 'request' in desc_lower or 'need' in desc_lower or 'could you' in desc_lower:
            lines.append('I would greatly appreciate your assistance with this matter.')
    
    # Add closing
    lines.append('')
    lines.append(template['closing'])
    
    # Add metadata
    result = '\n'.join(lines)
    result += f"\n\n[✨ Generated in {tone} tone - {template['style']}]"
    
    return result


def rewrite_existing_email(text: str, tone: str, template: dict) -> str:
    """
    Rewrite an existing email with specified tone
    """
    lines = text.strip().split('\n')
    rewritten_lines = []
    
    # Add appropriate greeting if not present
    first_line = lines[0].lower() if lines else ''
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
    result += f"\n\n[✨ Rewritten in {tone} tone - {template['style']}]"
    
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


def rewrite_email(text: str, tone: str = 'professional', mode: str = 'rewrite') -> str:
    """
    Main function to rewrite/generate email based on tone and mode
    Automatically selects the best available backend
    
    Args:
        text: Original email text or description for new email
        tone: Desired tone (formal, casual, professional, friendly, etc.)
        mode: 'write' for new email generation or 'rewrite' for rewriting existing email
    
    Returns:
        Rewritten or generated email text
    """
    
    # Validate inputs
    if not text or not text.strip():
        raise ValueError("Email text cannot be empty")
    
    if len(text.strip()) < 5:
        raise ValueError("Email text is too short")
    
    # Choose backend - Groq is preferred
    if USE_GROQ_API and GROQ_API_KEY:
        try:
            print(f"🚀 Using Groq API ({mode} mode, {tone} tone)")
            return rewrite_with_groq(text, tone, mode)
        except Exception as e:
            print(f"Groq API failed: {str(e)}")
            print("Falling back to mock generator...")
            return rewrite_with_mock(text, tone, mode)
    elif USE_HUGGINGFACE_API and HUGGINGFACE_API_KEY:
        try:
            print(f"🤖 Using Hugging Face API ({mode} mode, {tone} tone)")
            return rewrite_with_huggingface(text, tone, mode)
        except Exception as e:
            print(f"Hugging Face API failed: {str(e)}")
            print("Falling back to mock generator...")
            return rewrite_with_mock(text, tone, mode)
    else:
        print(f"📝 Using mock generator ({mode} mode, {tone} tone)")
        return rewrite_with_mock(text, tone, mode)


# Test function
if __name__ == "__main__":
    print("🧪 Testing Email Generator with Groq API\n")
    
    # Test 1: Write Mode
    print("=" * 70)
    print("TEST 1: WRITE MODE - Generate New Email")
    print("=" * 70)
    test_description = "I need to schedule a meeting with the team tomorrow at 2pm to discuss the Q4 project timeline and deliverables"
    
    try:
        result = rewrite_email(test_description, tone='professional', mode='write')
        print(f"\n📧 Generated Email:\n{result}\n")
    except Exception as e:
        print(f"❌ Error: {str(e)}\n")
    
    # Test 2: Rewrite Mode
    print("=" * 70)
    print("TEST 2: REWRITE MODE - Polish Existing Email")
    print("=" * 70)
    test_email = """
    hey,
    can you send me that report we talked about? need it by friday.
    thanks
    """
    
    try:
        result = rewrite_email(test_email, tone='formal', mode='rewrite')
        print(f"\n📧 Rewritten Email:\n{result}\n")
    except Exception as e:
        print(f"❌ Error: {str(e)}\n")
    
    # Test 3: Different Tones
    print("=" * 70)
    print("TEST 3: TONE VARIATIONS")
    print("=" * 70)
    test_text = "thank you for your help with the code yesterday"
    tones = ['professional', 'friendly', 'formal']
    
    for tone in tones:
        print(f"\n🎨 {tone.upper()} TONE:")
        print("-" * 70)
        try:
            result = rewrite_email(test_text, tone=tone, mode='write')
            print(result)
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        print("-" * 70)
    
    print("\n✅ Testing complete!")
    
    if not GROQ_API_KEY:
        print("\n⚠️  WARNING: GROQ_API_KEY not set!")
        print("Set it with: $env:GROQ_API_KEY='your-key-here'")
        print("Or see GROQ_SETUP.md for detailed instructions")
