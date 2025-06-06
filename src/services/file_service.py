# services/file_service.py
import mimetypes
from pathlib import Path
import mimetypes
from typing import Optional

class FileService:
    SUPPORTED_AUDIO_TYPES = {
        'audio/mpeg',
        'audio/mp4',
        'audio/wav',
        'audio/x-wav',
        'audio/flac',
        'audio/x-flac',
        'audio/mp3'
    }

    SUPPORTED_VIDEO_TYPES = {
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/quicktime',
        'video/x-msvideo'
    }

    SUPPORTED_EXTENSIONS = {
        '.mp3', '.mp4', '.wav', '.m4a', '.flac', '.avi', '.mov'
    }

    def is_supported_media_type(self, filename: Optional[str]) -> bool:
        """Check if the file type is supported for transcription"""
        if not filename:
            return False

        # Check by extension
        extension = Path(filename).suffix.lower()
        if extension in self.SUPPORTED_EXTENSIONS:
            return True

        # Check by MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type:
            return (mime_type in self.SUPPORTED_AUDIO_TYPES or
                   mime_type in self.SUPPORTED_VIDEO_TYPES)

        return False

    def get_file_type(self, file_path: str) -> Optional[str]:
        """Get the actual MIME type of a file"""
        try:
            mimetypes.guess_type(file_path)
        except Exception:
            # Fallback to mimetypes
            mime_type, _ = mimetypes.guess_type(file_path)
            return mime_type