# AV Analyzer

## Overview

This project is a POC to infer the meaning of a video or audio file based on the speech contained therein. Works by user uploading a sample video/audio file, transcribing the speech, and using the llm to analyze the transcript.

## Stack
- WhisperAI (via:faster_whisper)
- llama (llama3:8b)
- Language: Python, Typescript
- Frameworks: FastAPI, React
- Build: UV, Yarn, Vite
- Container: Docker

## Kick the tires
### CLI
```
git clone git@github.com:Systemicdrift/av_analyzer.git
cd av_analyzer
make setup-all
```

### In browser
[Goto](http://localhost:3000/)

### Sample files
```av_analyzer/sample_files/```