"""
SmartMail AI - Flask Backend Application
Email Rewriter & Tone Polisher with Voice Input
"""

from flask import Flask, render_template, request, jsonify
from datetime import datetime
import sqlite3
import os
from model import rewrite_email

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here-change-in-production'

# Database initialization
DATABASE = 'database.db'

def init_db():
    """Initialize the SQLite database"""
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS email_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_text TEXT NOT NULL,
                rewritten_text TEXT NOT NULL,
                tone TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database on startup
init_db()


@app.route('/')
def index():
    """Home page route"""
    return render_template('index.html')


@app.route('/rewrite')
def rewrite_page():
    """Rewrite page route"""
    return render_template('rewrite.html')


@app.route('/history')
def history():
    """History page route - displays saved rewrites"""
    conn = get_db_connection()
    history_records = conn.execute(
        'SELECT * FROM email_history ORDER BY timestamp DESC LIMIT 50'
    ).fetchall()
    conn.close()
    return render_template('history.html', history=history_records)


@app.route('/about')
def about():
    """About page route"""
    return render_template('about.html')


@app.route('/api/generate', methods=['POST'])
def generate():
    """
    API endpoint to generate rewritten email
    Accepts JSON with 'text' and 'tone' fields
    Returns rewritten email text
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        original_text = data.get('text', '').strip()
        tone = data.get('tone', 'professional').strip()
        save_history = data.get('save_history', True)
        
        # Validation
        if not original_text:
            return jsonify({'error': 'Email text is required'}), 400
        
        if len(original_text) < 10:
            return jsonify({'error': 'Email text is too short (minimum 10 characters)'}), 400
        
        if len(original_text) > 5000:
            return jsonify({'error': 'Email text is too long (maximum 5000 characters)'}), 400
        
        # Call AI model to rewrite email
        rewritten_text = rewrite_email(original_text, tone)
        
        # Save to database if requested
        if save_history:
            conn = get_db_connection()
            conn.execute(
                'INSERT INTO email_history (original_text, rewritten_text, tone) VALUES (?, ?, ?)',
                (original_text, rewritten_text, tone)
            )
            conn.commit()
            conn.close()
        
        return jsonify({
            'success': True,
            'rewritten_text': rewritten_text,
            'tone': tone,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    
    except Exception as e:
        print(f"Error in /api/generate: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/api/history/delete/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    """Delete a history record by ID"""
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM email_history WHERE id = ?', (history_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Record deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/history/clear', methods=['DELETE'])
def clear_history():
    """Clear all history records"""
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM email_history')
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'History cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    """404 error handler"""
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(e):
    """500 error handler"""
    return render_template('500.html'), 500


if __name__ == '__main__':
    print("🚀 Starting SmartMail AI Server...")
    print("📧 Email Rewriter & Tone Polisher")
    print("🌐 Server running at: http://127.0.0.1:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
