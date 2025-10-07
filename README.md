# 🗣️ SmartMail AI - Email Rewriter & Tone Polisher

![SmartMail AI](https://img.shields.io/badge/SmartMail-AI%20Powered-e94560?style=for-the-badge)
![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap)

> Transform your emails with intelligent AI-powered tone control. Type or speak your message, choose a tone, and let AI polish it to perfection!

## ✨ Features

- 🎤 **Voice Input** - Speech-to-text integration using Web Speech API
- 🎨 **8+ Tone Options** - Professional, Formal, Casual, Friendly, Persuasive, Empathetic, Concise, Apologetic
- 🤖 **AI-Powered Rewriting** - Intelligent email transformation while preserving meaning
- 📝 **History Tracking** - Save and review all your rewrites with SQLite database
- 📋 **One-Click Copy** - Instantly copy polished emails to clipboard
- 🌓 **Modern Dark Theme** - Beautiful UI inspired by Firebase Studio & JetBrains
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Processing** - Fast and efficient email rewriting

## 🎯 Project Purpose

This full-stack web application demonstrates comprehensive web development skills including:
- Frontend design with HTML5, Bootstrap 5, and custom CSS
- Interactive JavaScript with Promises, async/await, and callbacks
- Backend logic with Flask and Python
- Database management with SQLite
- AI/ML integration for intelligent text processing
- RESTful API design
- Modern UI/UX principles

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup structure
- **Bootstrap 5** - Responsive UI framework
- **Custom CSS** - Modern dark theme styling
- **JavaScript (ES6)** - Async/await, Promises, callbacks
- **jQuery** - DOM manipulation and animations
- **Web Speech API** - Voice input functionality
- **Font Awesome** - Beautiful icons

### Backend
- **Python 3** - Core programming language
- **Flask** - Web framework
- **Jinja2** - Template engine
- **SQLite** - Database for history management
- **Requests** - HTTP library for API calls

## 📁 Project Structure

```
fullstack/
│
├── static/
│   ├── css/
│   │   └── style.css          # Custom dark theme styles
│   ├── js/
│   │   ├── main.js            # General utilities
│   │   ├── rewrite.js         # Rewrite page logic
│   │   └── history.js         # History page logic
│   └── images/
│       └── hero-illustration.svg
│
├── templates/
│   ├── index.html             # Home page
│   ├── rewrite.html           # Email rewriting interface
│   ├── history.html           # History management
│   └── about.html             # About/documentation page
│
├── app.py                     # Flask application & routes
├── model.py                   # AI model integration
├── database.db               # SQLite database (auto-created)
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge)

### Installation Steps

1. **Clone or download the repository**
   ```bash
   cd c:\Users\yashj\Yashwanth\Stufffff\College-7thsem\fullstack
   ```

2. **Create a virtual environment (recommended)**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```powershell
   python app.py
   ```

5. **Open your browser**
   Navigate to: `http://127.0.0.1:5000`

## 💻 Usage Guide

### Rewriting an Email

1. **Navigate to the Rewrite page** from the navbar or home page
2. **Input your email** in one of two ways:
   - Type directly into the text area
   - Click the microphone button and speak (voice input)
3. **Select a tone** from the dropdown menu:
   - Professional - Clear and business-appropriate
   - Formal - Structured and respectful
   - Casual - Friendly and relaxed
   - Friendly - Warm and approachable
   - Persuasive - Compelling and action-oriented
   - Empathetic - Compassionate and understanding
   - Concise - Brief and to-the-point
   - Apologetic - Regretful and understanding
4. **Click "Rewrite Email"** and wait for AI processing
5. **Review the result** and use available actions:
   - Copy to clipboard
   - Regenerate for a different version
   - View in history

### Voice Input

1. Click the **microphone button** on the rewrite page
2. Allow microphone access when prompted
3. Speak your email clearly
4. The text will appear automatically in the text area
5. Click the button again to stop listening

### Managing History

1. Navigate to the **History page**
2. View all your past rewrites
3. Use the **search bar** to filter records
4. Available actions for each record:
   - Copy rewritten email
   - Compare original vs rewritten side-by-side
   - Delete individual records
5. Use **Clear All History** to remove all records

## 🎨 Color Scheme

The application uses a modern dark theme inspired by Firebase Studio and JetBrains:

- **Primary Background**: `#1a1a2e` - Deep navy
- **Secondary Background**: `#16213e` - Dark blue
- **Accent Primary**: `#e94560` - Vibrant pink/red
- **Accent Secondary**: `#f39c12` - Golden orange
- **Accent Tertiary**: `#00d4ff` - Bright cyan
- **Success**: `#00e676` - Neon green
- **Text Primary**: `#e8e8e8` - Light gray

## 🔧 Configuration

### Using Groq API (Recommended - Fast & Free!)

To use real AI instead of mock generation:

1. **Get Free API Key**: Visit [https://console.groq.com](https://console.groq.com)
2. **Set Environment Variable**:
   ```powershell
   $env:GROQ_API_KEY="your-api-key-here"
   ```
3. **Done!** The app automatically uses Groq API

📖 **See [GROQ_SETUP.md](GROQ_SETUP.md) for detailed setup instructions**

### Alternative: Hugging Face API (Optional)

If you prefer Hugging Face instead:

1. Get an API key from [Hugging Face](https://huggingface.co/)
2. Set environment variable:
   ```powershell
   $env:HUGGINGFACE_API_KEY="your-api-key-here"
   ```
3. In `model.py`, change:
   ```python
   USE_GROQ_API = False
   USE_HUGGINGFACE_API = True
   ```

### Database

The SQLite database (`database.db`) is automatically created on first run. To reset:
```powershell
Remove-Item database.db
python app.py
```

## 📊 Key Concepts Demonstrated

| Category | Technology | Usage in Project |
|----------|-----------|------------------|
| **Structure** | HTML5 | Semantic tags (header, nav, section, footer) |
| **Styling** | Bootstrap 5 | Responsive grid, cards, forms, navbar |
| **Custom UI** | CSS3 | Dark theme, animations, gradients |
| **Behavior** | JavaScript | Form handling, validation, DOM updates |
| **Async Logic** | Promises/async-await | API requests, data fetching |
| **Events** | Callbacks | Speech recognition, UI interactions |
| **Backend** | Flask | Routes, templates, JSON API |
| **Database** | SQLite | History storage and retrieval |
| **Intelligence** | AI/ML | Email rewriting with tone control |
| **Version Control** | Git | Repository management |

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Full-stack web development
- ✅ RESTful API design and implementation
- ✅ Asynchronous JavaScript programming
- ✅ Modern CSS with custom themes
- ✅ Database integration and management
- ✅ AI/ML model integration
- ✅ Voice input/speech recognition
- ✅ Responsive web design
- ✅ User experience optimization
- ✅ Code organization and documentation

## 📸 Screenshots

### Home Page
Modern landing page with feature highlights and call-to-action buttons.

### Rewrite Page
Interactive email rewriting interface with voice input and tone selection.

### History Page
Comprehensive history management with search and comparison features.

### About Page
Detailed project documentation and technology stack information.

## 🐛 Troubleshooting

### Voice Input Not Working
- Ensure you're using HTTPS or localhost
- Grant microphone permissions in browser
- Check browser compatibility (Chrome/Edge recommended)

### Database Errors
- Delete `database.db` and restart the application
- Check file permissions in the directory

### API Errors
- Check internet connection
- Verify Hugging Face API key if using
- Check Flask server logs for details

## 🚧 Future Enhancements

- [ ] User authentication and personal accounts
- [ ] Email templates library
- [ ] Multiple language support
- [ ] Export to various formats (PDF, DOC)
- [ ] Email sending integration
- [ ] Browser extension
- [ ] Mobile app version
- [ ] Advanced AI models with fine-tuning
- [ ] Collaboration features
- [ ] Analytics dashboard

## 👨‍💻 Developer

**Full-Stack Development Project**  
Created for: Full-Stack Web Development Course  
Technologies: Flask, Python, JavaScript, Bootstrap, SQLite, AI/ML

## 📝 License

This project is created for educational purposes as part of a full-stack development course.

## 🤝 Contributing

This is an educational project, but suggestions and improvements are welcome!

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check browser console for errors
4. Review Flask server logs

## 🌟 Acknowledgments

- Bootstrap team for the excellent UI framework
- Font Awesome for beautiful icons
- Flask community for comprehensive documentation
- Web Speech API for voice input capabilities
- Inspiration from Firebase Studio & JetBrains design

---

**Built with ❤️ for Full-Stack Development Course | SmartMail AI © 2025**
