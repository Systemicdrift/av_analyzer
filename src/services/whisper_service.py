from faster_whisper import WhisperModel
import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class WhisperService:
    def __init__(self, model_size: str = "large-v3"):
        """
        Initialize faster-whisper service with specified model size
        """
        self.model_size = model_size
        self.model: Optional[WhisperModel] = None
        self._load_model()

    def _load_model(self):
        """Load the faster-whisper model"""
        try:
            logger.info(f"Loading faster-whisper model: {self.model_size}")
            self.model = WhisperModel(self.model_size, compute_type="float32")
            logger.info("faster-whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load faster-whisper model: {e}")
            raise

    async def transcribe(self, audio_file_path: str) -> str:
        """Transcribe audio file to text using faster-whisper"""
        if not self.model:
            raise RuntimeError("Model not loaded")

        try:
            logger.info(f"Starting transcription for: {audio_file_path}")

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self._transcribe_sync, audio_file_path)

            logger.info("Transcription completed successfully")
            return result

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise

    def _transcribe_sync(self, audio_file_path: str) -> str:
        """Synchronous transcription method"""
        segments, _info = self.model.transcribe(audio_file_path)

        transcription = " ".join([segment.text for segment in segments])
        return transcription.strip()
