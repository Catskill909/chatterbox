# Installing Chatterbox TTS

## Important: Python Version Requirement

Chatterbox TTS requires **Python 3.11** (not 3.13). The current environment uses Python 3.13 which has compatibility issues.

## Option 1: Use Python 3.11 (Recommended for Full TTS)

```bash
# Install Python 3.11 via Homebrew
brew install python@3.11

# Recreate virtual environment with Python 3.11
cd backend
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt

# This will download ~2GB of models on first run
python app.py
```

## Option 2: Demo Mode (Current Setup)

The app currently runs in **demo mode** with:
- ✅ Full UI with language selector (23 languages)
- ✅ Voice controls (expressiveness, pacing)
- ✅ Feed parsing and post browsing
- ⏳ TTS generation (simulated - returns mock audio)

To enable real TTS, switch to Python 3.11 using Option 1.

## Features Available After TTS Installation

- **Real audio generation** from blog posts
- **23 languages**: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Dutch, Polish, Turkish, Swedish, Danish, Norwegian, Finnish, Greek, Hebrew, Malay, Swahili
- **Voice cloning** with reference audio
- **Paralinguistic tags**: [laugh], [cough], [chuckle] for Turbo model
- **Voice customization**: Adjust expressiveness and pacing

## System Requirements

- **Python**: 3.11 (required)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB for models
- **GPU**: Optional (CUDA for faster generation)

## First Run

When you first generate audio, Chatterbox will download models (~2GB). This happens once and takes 5-10 minutes depending on your connection.

## Troubleshooting

**Error: "No module named 'chatterbox'"**
- Make sure you're using Python 3.11, not 3.13

**Error: "CUDA not available"**
- This is normal on CPU-only systems. The app will use CPU mode (slower but works fine)

**Slow generation**
- First generation downloads models (one-time)
- CPU mode is slower than GPU (30-60s per post)
- Consider using shorter text excerpts for faster testing
