# Chatterbox TTS Demo

Convert blog posts to natural-sounding audio using Resemble AI's Chatterbox TTS.

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start the App

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Open in Browser

Navigate to: **http://localhost:3000**

## Features

- Dark mode Material-UI design
- RSS/Atom feed parser
- Blog post browser
- Clean, modern interface
- Resemble AI blog pre-loaded

## Next Steps

- Add Chatterbox TTS integration for audio generation
- Support for 23 languages
- Voice cloning capabilities
- WordPress plugin integration

## Tech Stack

**Backend:**
- Flask 3.0
- feedparser
- BeautifulSoup4

**Frontend:**
- React 18
- Material-UI v5
- Vite
- Axios

## Architecture

```
Frontend (React) → REST API → Backend (Flask) → Chatterbox TTS
```
