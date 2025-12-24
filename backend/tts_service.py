import os
import logging
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)

# Try to import torch/chatterbox, fall back to demo mode if not available
try:
    import torch
    import torchaudio as ta
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logger.warning("PyTorch not available - running in demo mode")

try:
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    CHATTERBOX_AVAILABLE = True
except ImportError:
    CHATTERBOX_AVAILABLE = False
    logger.warning("Chatterbox TTS not available - running in demo mode")

class TTSService:
    """Chatterbox TTS service with multi-language support"""
    
    def __init__(self, device='cpu'):
        self.device = device
        self.turbo_model = None
        self.multilingual_model = None
        self.audio_dir = 'audio_files'
        os.makedirs(self.audio_dir, exist_ok=True)
        logger.info(f"TTS Service initialized (device: {device})")
    
    def _load_turbo_model(self):
        """Load Chatterbox Turbo model (English, fast)"""
        if not CHATTERBOX_AVAILABLE:
            raise ImportError("Chatterbox TTS not installed. See INSTALL_TTS.md")
        
        if self.turbo_model is None:
            try:
                logger.info("Loading Chatterbox Turbo model...")
                self.turbo_model = ChatterboxTurboTTS.from_pretrained(device=self.device)
                logger.info("✓ Turbo model loaded")
            except Exception as e:
                if "token" in str(e).lower():
                    raise Exception("Hugging Face token required. See HUGGINGFACE_TOKEN.md for setup instructions.")
                logger.error(f"Error loading Turbo model: {e}")
                raise
        return self.turbo_model
    
    def _load_multilingual_model(self):
        """Load Chatterbox Multilingual model (23 languages)"""
        if not CHATTERBOX_AVAILABLE:
            raise ImportError("Chatterbox TTS not installed. See INSTALL_TTS.md")
        
        if self.multilingual_model is None:
            try:
                logger.info("Loading Chatterbox Multilingual model...")
                # Force CPU loading by temporarily overriding torch.load
                import torch
                original_load = torch.load
                
                def cpu_load(*args, **kwargs):
                    kwargs['map_location'] = 'cpu'
                    return original_load(*args, **kwargs)
                
                torch.load = cpu_load
                try:
                    self.multilingual_model = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
                finally:
                    torch.load = original_load
                    
                logger.info("✓ Multilingual model loaded")
            except Exception as e:
                if "token" in str(e).lower():
                    raise Exception("Hugging Face token required. See HUGGINGFACE_TOKEN.md for setup instructions.")
                logger.error(f"Error loading Multilingual model: {e}")
                raise
        return self.multilingual_model
    
    def generate(self, text, language='en', voice_file=None, exaggeration=0.5, cfg_weight=0.5):
        """
        Generate audio from text
        
        Args:
            text: Text to convert to speech
            language: Language code (en, es, fr, de, etc.)
            voice_file: Optional path to reference audio for voice cloning
            exaggeration: Voice expressiveness (0.0-1.0, higher = more dramatic)
            cfg_weight: Pacing control (0.0-1.0, lower = slower/more deliberate)
        
        Returns:
            dict with audio_path and audio_id
        """
        # Demo mode: Return mock response if Chatterbox not available
        if not CHATTERBOX_AVAILABLE:
            logger.info(f"DEMO MODE: Simulating TTS for {len(text)} chars in {language}")
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
            filename = f"demo_{language}_{timestamp}_{text_hash}.txt"
            filepath = os.path.join(self.audio_dir, filename)
            
            # Create a text file as placeholder
            with open(filepath, 'w') as f:
                f.write(f"DEMO MODE - TTS not installed\n\n")
                f.write(f"Language: {language}\n")
                f.write(f"Expressiveness: {exaggeration}\n")
                f.write(f"Pacing: {cfg_weight}\n\n")
                f.write(f"Text ({len(text)} chars):\n{text[:500]}")
            
            audio_id = hashlib.md5(filename.encode()).hexdigest()[:12]
            
            return {
                'audio_path': filepath,
                'audio_id': audio_id,
                'filename': filename,
                'sample_rate': 24000,
                'demo_mode': True
            }
        
        try:
            # Choose model based on language
            if language == 'en':
                model = self._load_turbo_model()
                logger.info(f"Using Turbo model for English")
                
                # Generate with Turbo
                if voice_file and os.path.exists(voice_file):
                    wav = model.generate(text, audio_prompt_path=voice_file)
                else:
                    wav = model.generate(text)
            else:
                model = self._load_multilingual_model()
                logger.info(f"Using Multilingual model for {language}")
                
                # Generate with Multilingual
                if voice_file and os.path.exists(voice_file):
                    wav = model.generate(
                        text, 
                        language_id=language,
                        audio_prompt_path=voice_file,
                        exaggeration=exaggeration,
                        cfg_weight=cfg_weight
                    )
                else:
                    wav = model.generate(
                        text,
                        language_id=language,
                        exaggeration=exaggeration,
                        cfg_weight=cfg_weight
                    )
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
            filename = f"tts_{language}_{timestamp}_{text_hash}.wav"
            filepath = os.path.join(self.audio_dir, filename)
            
            # Save audio
            ta.save(filepath, wav, model.sr)
            logger.info(f"✓ Audio saved: {filename}")
            
            # Generate audio ID
            audio_id = hashlib.md5(filename.encode()).hexdigest()[:12]
            
            return {
                'audio_path': filepath,
                'audio_id': audio_id,
                'filename': filename,
                'sample_rate': model.sr
            }
            
        except Exception as e:
            logger.error(f"Error generating audio: {e}")
            raise
    
    def get_audio_path(self, audio_id):
        """Get audio file path from ID"""
        try:
            for filename in os.listdir(self.audio_dir):
                if hashlib.md5(filename.encode()).hexdigest()[:12] == audio_id:
                    return os.path.join(self.audio_dir, filename)
            return None
        except Exception as e:
            logger.error(f"Error getting audio path: {e}")
            return None
