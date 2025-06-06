# schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TranscriptionJobBase(BaseModel):
    filename: str
    analysis_prompt: str

class TranscriptionJobCreate(TranscriptionJobBase):
    file_hash: str
    status: str = "pending"

class TranscriptionJobResponse(TranscriptionJobBase):
    id: int
    file_hash: str
    status: str
    transcript: Optional[str] = None
    analysis_result: Optional[str] = None
    error_message: Optional[str] = None
    file_size: Optional[int] = None
    duration: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AnalysisRequest(BaseModel):
    prompt: str

class HealthCheck(BaseModel):
    status: str