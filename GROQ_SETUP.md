# 🚀 Groq API Setup Guide

## What is Groq?
Groq provides ultra-fast AI inference with free API access. Perfect for our email generation!

## Step 1: Get Your Free Groq API Key

1. **Visit Groq Console**: Go to [https://console.groq.com](https://console.groq.com)

2. **Sign Up / Login**:
   - Click "Sign Up" or "Login"
   - Use Google, GitHub, or email
   - It's completely FREE!

3. **Create API Key**:
   - Once logged in, go to "API Keys" section
   - Click "Create API Key"
   - Give it a name like "SmartMail AI"
   - Copy the API key (starts with `gsk_...`)
   - **Important**: Save it somewhere safe!

## Step 2: Set Up API Key in Your Project

### Option 1: Environment Variable (Recommended)

**Windows PowerShell:**
```powershell
# Set for current session
$env:GROQ_API_KEY="your-api-key-here"

# Set permanently (requires admin)
[System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', 'your-api-key-here', 'User')
```

**Windows Command Prompt:**
```cmd
set GROQ_API_KEY=your-api-key-here
```

### Option 2: Create .env File

1. Create a file named `.env` in your project root:
```
GROQ_API_KEY=your-api-key-here
```

2. Install python-dotenv:
```powershell
pip install python-dotenv
```

3. Add to `app.py` (at the top):
```python
from dotenv import load_dotenv
load_dotenv()
```

### Option 3: Direct in Code (Not Recommended for Production)

Edit `model.py` line 11:
```python
GROQ_API_KEY = "your-api-key-here"  # Replace with your actual key
```

## Step 3: Verify Setup

Run the test script:
```powershell
python model.py
```

You should see:
```
🧪 Testing Email Generator with Groq API
🚀 Using Groq API (write mode, professional tone)
[Generated email output]
```

## Step 4: Run Your Application

```powershell
python app.py
```

Then open: http://127.0.0.1:5000

## Features with Groq API

✅ **Write Mode**:
- Describe what you want to say
- AI generates complete email
- Multiple tones supported

✅ **Rewrite Mode**:
- Paste existing email
- AI improves and polishes
- Maintains original meaning

✅ **Fast Response**:
- Groq is extremely fast (< 2 seconds)
- Better than mock generator
- More natural language

## Troubleshooting

### Error: "Groq API key not found"
**Solution**: Make sure you set the environment variable correctly
```powershell
# Check if it's set
echo $env:GROQ_API_KEY

# Set it again if needed
$env:GROQ_API_KEY="your-key-here"
```

### Error: "Groq API Error: 401"
**Solution**: Your API key is invalid or expired
- Get a new key from console.groq.com
- Make sure you copied the entire key

### Error: "Network error"
**Solution**: Check your internet connection
- Make sure you can access groq.com
- Check firewall settings

### Falls back to mock generator
**Solution**: 
- Check if USE_GROQ_API is True in model.py (line 11)
- Verify API key is set correctly
- Check terminal output for error messages

## API Limits

**Groq Free Tier**:
- ✅ 30 requests per minute
- ✅ 14,400 requests per day
- ✅ No credit card required
- ✅ Perfect for development and testing

## Models Available

Current model: **mixtral-8x7b-32768**
- Fast and capable
- Excellent for email generation
- Supports long context

Other options (edit model.py line 48):
- `llama3-70b-8192` - Very capable
- `llama3-8b-8192` - Fastest
- `gemma-7b-it` - Good balance

## Example Usage

### Write a Meeting Request:
```
Input: "I need to schedule a meeting tomorrow at 2pm to discuss the project timeline"
Tone: Professional
Mode: Write

Output: Complete professional meeting request email
```

### Rewrite Casual to Formal:
```
Input: "hey can u send me the report by friday thanks"
Tone: Formal
Mode: Rewrite

Output: Professionally rewritten formal request
```

## Security Notes

⚠️ **Never commit API keys to Git**
- Use environment variables
- Add `.env` to `.gitignore`
- Use different keys for dev/prod

✅ **Keep your key safe**
- Don't share it publicly
- Regenerate if compromised
- Use separate keys for different projects

## Support

- **Groq Docs**: https://console.groq.com/docs
- **API Reference**: https://console.groq.com/docs/api-reference
- **Discord**: https://discord.gg/groq

---

**You're all set! Enjoy ultra-fast AI email generation! 🎉**
