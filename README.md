# AV Analyzer

## Overview

This project is a POC to infer the meaning of a video or audio file based on the speech contained therein. Works by user uploading a sample video/audio file, transcribing the speech, and using the llm to analyze the transcript. Built with the help of claude sonnet.

## Stack
- WhisperAI (via:faster_whisper)
- llama (llama3:8b)
- Language: Python, Typescript
- Frameworks: FastAPI, React
- Build: UV, Yarn, Vite
- Container: Docker

## Kick the tires
Warning: the LLM is 5GB in size, plus docker containers.
### CLI
```
git clone git@github.com:Systemicdrift/av_analyzer.git
cd av_analyzer
make setup-all
```
Wait for av_analyzer-api-1 to start, takes a few minutes. See the following, may not be in the order presented:
```
frontend-1  |  INFO  Accepting connections at http://localhost:3000
...
api-1       | INFO:     Started server process [8]
api-1       | INFO:     Waiting for application startup.
api-1       | INFO:     Application startup complete.
...
ollama-1    | verifying sha256 digest
ollama-1    | writing manifest
ollama-1    | success
...
```

### In browser
[Goto](http://localhost:3000/)

### Sample files
```av_analyzer/sample_files/```