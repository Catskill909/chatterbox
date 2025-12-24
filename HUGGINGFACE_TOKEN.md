# Hugging Face Token Required

Chatterbox TTS requires a Hugging Face token to download models.

## Quick Setup (2 minutes):

### 1. Get Your Token
Visit: https://huggingface.co/settings/tokens

Click **"New token"** → **"Read"** access → Copy the token

### 2. Set the Token

**Option A - Environment Variable (Recommended):**
```bash
export HF_TOKEN="your_token_here"
```

**Option B - Login via CLI:**
```bash
cd backend
source venv/bin/activate
huggingface-cli login
# Paste your token when prompted
```

**Option C - Add to .env file:**
```bash
echo "HF_TOKEN=your_token_here" > backend/.env
```

### 3. Restart Backend
```bash
cd backend
source venv/bin/activate
python app.py
```

## Why This Is Needed

Chatterbox models are hosted on Hugging Face and require authentication to download. This is a one-time setup - after the models are downloaded (~2GB), you won't need the token again unless you delete the cache.

## Model Download

First audio generation will download:
- Chatterbox Turbo model (~1.5GB) for English
- Chatterbox Multilingual model (~2GB) for other languages

This takes 5-10 minutes on first run, then generation is fast!
