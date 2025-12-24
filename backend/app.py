import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import feedparser
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route("/api/health")
def health():
    return jsonify({"status": "healthy", "service": "Chatterbox TTS Demo"})

@app.route("/api/feed")
def get_feed():
    try:
        url = request.args.get("url", "https://blog.resemble.ai/feed/")
        logger.info(f"Fetching feed: {url}")
        
        feed = feedparser.parse(url)
        posts = []
        
        for entry in feed.entries[:10]:
            # Extract content
            content = entry.get("summary", entry.get("description", ""))
            soup = BeautifulSoup(content, "html.parser")
            text = soup.get_text(separator=" ", strip=True)
            
            posts.append({
                "id": entry.get("link", ""),
                "title": entry.get("title", "Untitled"),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "author": entry.get("author", "Unknown"),
                "excerpt": text[:200] + "..." if len(text) > 200 else text,
                "content": text[:2000]
            })
        
        logger.info(f"Fetched {len(posts)} posts")
        return jsonify({"success": True, "posts": posts, "count": len(posts)})
    
    except Exception as e:
        logger.error(f"Error fetching feed: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/languages")
def get_languages():
    languages = [
        {"code": "en", "name": "English"},
        {"code": "es", "name": "Spanish"},
        {"code": "fr", "name": "French"},
        {"code": "de", "name": "German"},
        {"code": "it", "name": "Italian"},
        {"code": "pt", "name": "Portuguese"},
        {"code": "ru", "name": "Russian"},
        {"code": "zh", "name": "Chinese"},
        {"code": "ja", "name": "Japanese"},
        {"code": "ko", "name": "Korean"},
    ]
    return jsonify({"languages": languages})

@app.route("/api/generate", methods=["POST"])
def generate_audio():
    data = request.json
    text = data.get("text", "")
    language = data.get("language", "en")
    
    # Placeholder for TTS integration
    return jsonify({
        "success": True,
        "message": "TTS generation will be added after Chatterbox installation",
        "text_length": len(text),
        "language": language
    })

if __name__ == "__main__":
    print("🎵 Chatterbox TTS Backend")
    print("📡 Running on http://localhost:8000")
    print("Press Ctrl+C to stop\n")
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)
