import logging
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import feedparser
from bs4 import BeautifulSoup
from tts_service import TTSService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize TTS service (lazy loading)
tts_service = None

def get_tts_service():
    global tts_service
    if tts_service is None:
        device = 'cuda' if os.environ.get('USE_GPU') == '1' else 'cpu'
        tts_service = TTSService(device=device)
    return tts_service

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
        {"code": "en", "name": "English", "flag": "🇬🇧"},
        {"code": "es", "name": "Spanish", "flag": "🇪🇸"},
        {"code": "fr", "name": "French", "flag": "🇫🇷"},
        {"code": "de", "name": "German", "flag": "🇩🇪"},
        {"code": "it", "name": "Italian", "flag": "🇮🇹"},
        {"code": "pt", "name": "Portuguese", "flag": "🇵🇹"},
        {"code": "ru", "name": "Russian", "flag": "🇷🇺"},
        {"code": "zh", "name": "Chinese", "flag": "🇨🇳"},
        {"code": "ja", "name": "Japanese", "flag": "🇯🇵"},
        {"code": "ko", "name": "Korean", "flag": "🇰🇷"},
        {"code": "ar", "name": "Arabic", "flag": "🇸🇦"},
        {"code": "hi", "name": "Hindi", "flag": "🇮🇳"},
        {"code": "nl", "name": "Dutch", "flag": "🇳🇱"},
        {"code": "pl", "name": "Polish", "flag": "🇵🇱"},
        {"code": "tr", "name": "Turkish", "flag": "🇹🇷"},
        {"code": "sv", "name": "Swedish", "flag": "🇸🇪"},
        {"code": "da", "name": "Danish", "flag": "🇩🇰"},
        {"code": "no", "name": "Norwegian", "flag": "🇳🇴"},
        {"code": "fi", "name": "Finnish", "flag": "🇫🇮"},
        {"code": "el", "name": "Greek", "flag": "🇬🇷"},
        {"code": "he", "name": "Hebrew", "flag": "🇮🇱"},
        {"code": "ms", "name": "Malay", "flag": "🇲🇾"},
        {"code": "sw", "name": "Swahili", "flag": "🇰🇪"},
    ]
    return jsonify({"languages": languages})

@app.route("/api/generate", methods=["POST"])
def generate_audio():
    try:
        data = request.json
        text = data.get("text", "")
        language = data.get("language", "en")
        exaggeration = float(data.get("exaggeration", 0.5))
        cfg_weight = float(data.get("cfg_weight", 0.5))
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        if len(text) > 5000:
            return jsonify({"error": "Text too long (max 5000 characters)"}), 400
        
        logger.info(f"Generating audio: {len(text)} chars, language={language}")
        
        # Get TTS service and generate
        tts = get_tts_service()
        result = tts.generate(
            text=text,
            language=language,
            exaggeration=exaggeration,
            cfg_weight=cfg_weight
        )
        
        return jsonify({
            "success": True,
            "audio_id": result['audio_id'],
            "audio_url": f"/api/audio/{result['audio_id']}",
            "filename": result['filename'],
            "text_length": len(text),
            "language": language
        })
        
    except Exception as e:
        logger.error(f"Error generating audio: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/audio/<audio_id>")
def get_audio(audio_id):
    try:
        tts = get_tts_service()
        audio_path = tts.get_audio_path(audio_id)
        
        if not audio_path or not os.path.exists(audio_path):
            return jsonify({"error": "Audio file not found"}), 404
        
        return send_file(
            audio_path,
            mimetype='audio/wav',
            as_attachment=request.args.get('download') == 'true',
            download_name=f'chatterbox_{audio_id}.wav'
        )
    except Exception as e:
        logger.error(f"Error serving audio: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🎵 Chatterbox TTS Backend")
    print("📡 Running on http://localhost:8000")
    print("Press Ctrl+C to stop\n")
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)
