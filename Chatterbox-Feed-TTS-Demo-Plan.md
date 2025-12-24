# Chatterbox WordPress Feed TTS Demo: Ground Plan

## Concept
Build a Python demo app that:
- Fetches posts from a WordPress RSS/Atom feed.
- Lets the user select a post and a language.
- Uses Chatterbox (TTS) to generate an audio file for the selected post in the chosen language.
- Allows the user to listen to or download the audio file.

## Steps
1. **Feed Fetching**
   - Use Python (e.g., `feedparser`) to fetch and parse the WordPress feed.
   - Display a list of recent posts (title, date, excerpt).

2. **User Interface**
   - Use Gradio (or Streamlit) for a simple web UI.
   - UI lets user:
     - Select a post from the feed.
     - Choose a language (from Chatterbox's supported list).
     - Click a button to generate audio.

3. **TTS Generation**
   - Use Chatterbox (Turbo or Multilingual) to synthesize the post content in the selected language.
   - Save the output as a .wav file.

4. **Playback/Download**
   - Provide a player and download link for the generated audio.

5. **Local Testing**
   - Run and test locally (CPU is fine for demo).

6. **Next Steps**
   - If demo is successful, plan for WordPress plugin integration (step 2).

## Requirements
- Python 3.11+
- Packages: `chatterbox-tts`, `feedparser`, `gradio` (or `streamlit`), `torchaudio`, `torch`

## Notes
- Start with English and Multilingual models.
- For language selection, use Chatterbox's supported language codes.
- For voice cloning, optionally allow uploading a reference audio clip.
- Keep UI simple for demo.

---

**Review this plan and suggest changes or approve to proceed.**
