"""
AI Email Generator using Groq API
Professional email writing and rewriting with AI
"""

import os
import requests

# Configuration
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"  # High-quality GPT model


def get_system_prompt(mode: str, tone: str) -> str:
    """
    Generate optimized system prompt based on mode and tone
    """
    if mode == 'write':
        return f"""You are a professional email writer. Write clear, natural, and effective emails.

TASK: Generate a complete email based on the user's description or requirements.

TONE: {tone.capitalize()}

GUIDELINES:
- Write in {tone} tone throughout the entire email
- Include appropriate greeting (e.g., "Hi," "Dear," "Hello,")
- Write clear and concise body paragraphs
- Include appropriate closing (e.g., "Best regards," "Thanks," "Sincerely,")
- Make it natural and ready to send
- DO NOT include subject line
- DO NOT add any meta-commentary or explanations
- Keep it professional and well-structured

OUTPUT: Return ONLY the email content, nothing else."""
    else:  # rewrite mode
        return f"""You are a professional email editor. Improve and polish emails while maintaining their meaning.

TASK: Rewrite the given email to make it better and more professional.

TONE: {tone.capitalize()}

GUIDELINES:
- Rewrite in {tone} tone
- Preserve the original message and intent
- Fix grammar, spelling, and punctuation
- Improve clarity and structure
- Make it more professional and polished
- Keep the same general length
- Maintain appropriate greetings and closings
- DO NOT add subject line
- DO NOT add meta-commentary

OUTPUT: Return ONLY the rewritten email, nothing else."""


def rewrite_email(text: str, tone: str = 'professional', mode: str = 'rewrite') -> str:
    """
    Main function to generate or rewrite emails using Groq API
    
    Args:
        text: Original email or description
        tone: Desired tone (professional, formal, casual, friendly, etc.)
        mode: 'write' for new email or 'rewrite' to polish existing email
    
    Returns:
        Generated or rewritten email text
    """
    # Validate inputs
    if not text or not text.strip():
        raise ValueError("Email text cannot be empty")
    
    if len(text.strip()) < 5:
        raise ValueError("Email text is too short (minimum 5 characters)")
    
    if not GROQ_API_KEY:
        raise ValueError("Groq API key not found. Please set GROQ_API_KEY environment variable. Run setup_groq.ps1 for help.")
    
    # Prepare API request
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = get_system_prompt(mode, tone)
    
    if mode == 'write':
        user_prompt = f"Write an email based on this description:\n\n{text}"
    else:
        user_prompt = f"Rewrite this email:\n\n{text}"
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1500,
        "top_p": 0.95,
        "stream": False
    }
    
    try:
        print(f"🚀 Calling Groq API ({mode} mode, {tone} tone)...")
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'choices' in result and len(result['choices']) > 0:
                generated_text = result['choices'][0]['message']['content'].strip()
                print(f"✅ Email generated successfully!")
                return generated_text
            else:
                raise Exception("Invalid response from Groq API - no content returned")
        
        elif response.status_code == 401:
            raise Exception("Invalid Groq API key. Please check your GROQ_API_KEY environment variable.")
        
        elif response.status_code == 429:
            raise Exception("Rate limit exceeded. Please wait a moment and try again.")
        
        else:
            error_msg = f"Groq API Error ({response.status_code})"
            try:
                error_data = response.json()
                if 'error' in error_data:
                    error_msg += f": {error_data['error'].get('message', 'Unknown error')}"
            except:
                error_msg += f": {response.text[:200]}"
            raise Exception(error_msg)
    
    except requests.exceptions.Timeout:
        raise Exception("Request timeout. Please check your internet connection and try again.")
    
    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error: {str(e)}")
    
    except Exception as e:
        error_str = str(e)
        if "Invalid API key" in error_str or "401" in error_str:
            raise Exception("Invalid Groq API key. Run setup_groq.ps1 to configure your API key.")
        raise



# Test function
if __name__ == "__main__":
    print("=" * 80)
    print("🧪 Testing Groq API Email Generator")
    print("=" * 80)
    
    if not GROQ_API_KEY:
        print("\n❌ ERROR: GROQ_API_KEY not set!")
        print("\n📝 To fix this:")
        print("   1. Run: .\\setup_groq.ps1")
        print("   2. Or manually set: $env:GROQ_API_KEY='your-key-here'")
        print("   3. Get your free API key at: https://console.groq.com")
        exit(1)
    
    # Test 1: Write Mode
    print("\n" + "=" * 80)
    print("TEST 1: WRITE MODE - Generate New Email")
    print("=" * 80)
    test_description = "schedule a team meeting tomorrow at 2pm to discuss Q4 project timeline"
    
    try:
        result = rewrite_email(test_description, tone='professional', mode='write')
        print(f"\n📧 Generated Email:\n\n{result}\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
    
    # Test 2: Rewrite Mode
    print("=" * 80)
    print("TEST 2: REWRITE MODE - Polish Existing Email")
    print("=" * 80)
    test_email = """hey,
can you send me that report? need it asap.
thanks"""
    
    try:
        result = rewrite_email(test_email, tone='formal', mode='rewrite')
        print(f"\n📧 Rewritten Email:\n\n{result}\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
    
    print("=" * 80)
    print("✅ Testing complete!")
    print("=" * 80)
