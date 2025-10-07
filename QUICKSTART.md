# 🚀 Quick Start Guide - SmartMail AI

## Prerequisites
- Python 3.8+ installed
- Modern web browser (Chrome/Edge recommended for voice input)

## Step 1: Install Dependencies

```powershell
# Open PowerShell in the project directory
cd c:\Users\yashj\Yashwanth\Stufffff\College-7thsem\fullstack

# (Optional but recommended) Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install required packages
pip install -r requirements.txt
```

## Step 2: Run the Application

```powershell
# Start the Flask server
python app.py
```

You should see:
```
🚀 Starting SmartMail AI Server...
📧 Email Rewriter & Tone Polisher
🌐 Server running at: http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000
```

## Step 3: Open in Browser

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

## Step 4: Test the Application

### Test Voice Input:
1. Go to "Rewrite" page
2. Click the microphone button
3. Allow microphone access
4. Speak: "Hi, I need to request a meeting with you tomorrow to discuss the project timeline. Thanks!"
5. Click "Rewrite Email"
6. See the result!

### Test Different Tones:
Try rewriting the same email with different tones:
- Professional
- Formal
- Casual
- Friendly
- Persuasive

### Test History:
1. After rewriting a few emails, go to "History" page
2. Search, compare, copy, or delete records
3. Use "Clear All History" to reset

## Troubleshooting

### Issue: ModuleNotFoundError
**Solution**: Make sure you installed dependencies
```powershell
pip install -r requirements.txt
```

### Issue: Port already in use
**Solution**: Use a different port
```powershell
# In app.py, change the last line to:
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Issue: Voice input not working
**Solution**: 
- Use Chrome or Edge browser
- Allow microphone permissions
- Ensure you're on localhost or HTTPS

### Issue: Database errors
**Solution**: Delete database.db and restart
```powershell
Remove-Item database.db
python app.py
```

## Features to Try

✅ Type or speak your email  
✅ Choose from 8+ different tones  
✅ Copy rewritten emails instantly  
✅ View and search history  
✅ Compare original vs rewritten  
✅ Regenerate for different versions  
✅ Responsive on mobile devices  

## Stop the Server

Press `Ctrl + C` in the terminal to stop the Flask server

## Next Steps

1. **Customize**: Edit colors in `static/css/style.css`
2. **Add AI**: Set up Hugging Face API in `model.py`
3. **Deploy**: Use platforms like Render, Heroku, or PythonAnywhere
4. **Enhance**: Add new tones or features

## Project Structure Quick Reference

```
fullstack/
├── app.py                 # Main Flask application
├── model.py              # AI rewriting logic
├── templates/            # HTML pages
├── static/
│   ├── css/             # Styles (dark theme)
│   └── js/              # JavaScript (voice, async)
├── database.db          # SQLite (auto-created)
└── requirements.txt     # Dependencies
```

## Demo Email Examples

### Example 1: Meeting Request
**Input**: "hey can we meet tomorrow around 2pm to talk about the project"
**Try tones**: Professional, Formal

### Example 2: Apology
**Input**: "sorry i missed the deadline, had some personal issues"
**Try tones**: Apologetic, Professional, Empathetic

### Example 3: Thank You
**Input**: "thanks for helping me with the code yesterday"
**Try tones**: Friendly, Professional, Grateful

### Example 4: Request
**Input**: "i need the report by friday, please send it asap"
**Try tones**: Polite, Professional, Persuasive

## Need Help?

- Check the full README.md for detailed documentation
- Review code comments in Python and JavaScript files
- Check browser console (F12) for JavaScript errors
- Check terminal for Flask server logs

---

**Enjoy using SmartMail AI! 🎉**
