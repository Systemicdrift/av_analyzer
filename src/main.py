from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import hashlib
import tempfile
import os
from typing import Optional
import asyncio
from pathlib import Path

from .database import get_db, SessionLocal, engine
from .models import TranscriptionJob, Base
from .schemas import TranscriptionJobResponse, AnalysisRequest, TranscriptionJobCreate
from .services.whisper_service import WhisperService
from .services.llm_service import LLMService
from .services.file_service import FileService

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Media Transcription & Analysis Service",
    description="Upload media files for AI-powered transcription and analysis",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
whisper_service = WhisperService()
llm_service = LLMService()
file_service = FileService()

@app.get("/")
async def root():
    return {"message": "Media Transcription & Analysis Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upload", response_model=TranscriptionJobResponse)
async def upload_media(
    file: UploadFile = File(...),
    analysis_prompt: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Upload a media file for transcription and analysis"""

    # Validate file type
    if not file_service.is_supported_media_type(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Supported: mp3, mp4, wav, m4a, flac"
        )

    try:
        # Create file hash
        file_content = await file.read()
        file_hash = hashlib.sha256(file_content).hexdigest()

        # Check if file already processed
        existing_job = db.query(TranscriptionJob).filter(
            TranscriptionJob.file_hash == file_hash
        ).first()

        if existing_job:
            if analysis_prompt and existing_job.analysis_prompt != analysis_prompt:
                # Re-analyze with new prompt
                await reanalyze_job(existing_job.id, analysis_prompt, db)
            return TranscriptionJobResponse.from_orm(existing_job)

        # Create new job record
        job_data = TranscriptionJobCreate(
            filename=file.filename,
            file_hash=file_hash,
            analysis_prompt=analysis_prompt or "Analyze and categorize this content. Identify and create a list of keywords.",
            status="processing"
        )

        db_job = TranscriptionJob(**job_data.dict())
        db.add(db_job)
        db.commit()
        db.refresh(db_job)

        # Process file asynchronously
        asyncio.create_task(process_media_file(
            file_content,
            file.filename,
            file_hash,
            analysis_prompt or "Analyze and categorize this content. Identify and create a list of keywords.",
            db_job.id
        ))

        return TranscriptionJobResponse.from_orm(db_job)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/job/{job_id}", response_model=TranscriptionJobResponse)
async def get_job_status(job_id: int, db: Session = Depends(get_db)):
    """Get the status and results of a transcription job"""

    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return TranscriptionJobResponse.from_orm(job)

@app.post("/job/{job_id}/reanalyze")
async def reanalyze_job(job_id: int, request: AnalysisRequest, db: Session = Depends(get_db)):
    """Re-analyze an existing transcription with a new prompt"""

    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not job.transcript:
        raise HTTPException(status_code=400, detail="No transcript available for analysis")

    try:
        # Update job with new prompt and set to processing
        job.analysis_prompt = request.prompt
        job.status = "processing"
        job.analysis_result = None
        job.error_message = None
        db.commit()

        # Analyze with new prompt
        analysis_result = await llm_service.analyze_text(job.transcript, request.prompt)

        # Update job with results
        job.analysis_result = analysis_result
        job.status = "completed"
        db.commit()

        return {"message": "Re-analysis completed", "job_id": job_id}

    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Re-analysis failed: {str(e)}")

@app.get("/jobs")
async def list_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all transcription jobs"""

    jobs = db.query(TranscriptionJob).offset(skip).limit(limit).all()
    return [TranscriptionJobResponse.from_orm(job) for job in jobs]

async def process_media_file(
    file_content: bytes,
    filename: str,
    file_hash: str,
    analysis_prompt: str,
    job_id: int
):
    """Background task to process uploaded media file"""

    db = SessionLocal()
    job = db.query(TranscriptionJob).filter(TranscriptionJob.id == job_id).first()

    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix) as tmp_file:
            tmp_file.write(file_content)
            tmp_file_path = tmp_file.name

        try:
            # Transcribe audio
            transcript = await whisper_service.transcribe(tmp_file_path)

            # Update job with transcript
            job.transcript = transcript
            job.status = "analyzing"
            db.commit()

            # Analyze transcript
            analysis_result = await llm_service.analyze_text(transcript, analysis_prompt)

            # Update job with final results
            job.analysis_result = analysis_result
            job.status = "completed"
            db.commit()

        finally:
            # Clean up temporary file
            os.unlink(tmp_file_path)

    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)