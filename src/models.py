# models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class TranscriptionJob(Base):
    __tablename__ = "transcription_jobs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_hash = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="pending")  # pending, processing, analyzing, completed, failed
    transcript = Column(Text, nullable=True)
    analysis_prompt = Column(Text, nullable=False)
    analysis_result = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    file_size = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)  # Audio duration in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
