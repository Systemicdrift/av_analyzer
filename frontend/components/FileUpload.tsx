// src/components/FileUpload.tsx
import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File, analysisPrompt: string) => void;
  isUploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState(
    'Analyze and categorize this content. Identify and create a list of keywords.'
  );
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && analysisPrompt.trim()) {
      onUpload(selectedFile, analysisPrompt.trim());
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`card cursor-pointer ${
          dragOver
            ? 'border-blue-400 bg-blue-100'
            : selectedFile
            ? 'border-success bg-success bg-opacity-10'
            : 'border-base-300 hover:border-base-content'
        } border-2 border-dashed p-6 text-center`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {selectedFile ? (
          <div className="flex justify-between gap-3">
            <div className="flex gap-3">
              <File className="text-success" />
              <div>
                <p className="font-semibold text-success">{selectedFile.name}</p>
                <p className="text-sm text-success">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button type="button" onClick={clearFile} className="btn btn-primary">
              <X />
            </button>
          </div>
        ) : (
          <>
            <Upload className="text-base-content mx-auto mb-3" />
            <p className="font-semibold">Drop your file here or click to browse</p>
            <p className="text-sm text-base-content">Supports MP3, MP4, WAV, M4A, FLAC</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.mp4,.wav,.m4a,.flac,.avi,.mov"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-outline w-full"
        >
          Choose File
        </button>
      )}

      {/* Prompt */}
      <div>
        <label htmlFor="prompt" className="label">
          <span className="label-text">Analysis Prompt</span>
        </label>
        <textarea
          id="prompt"
          value={analysisPrompt}
          onChange={(e) => setAnalysisPrompt(e.target.value)}
          className="textarea textarea-bordered w-full"
          rows={3}
          placeholder="Describe how you want the AI to analyze the content..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedFile || !analysisPrompt.trim() || isUploading}
        className="btn btn-primary w-full disabled:btn-disabled"
      >
        {isUploading ? (
          <>
            <span className="loading loading-spinner"></span>
            Processing...
          </>
        ) : (
          <>
            <Upload />
            Upload & Analyze
          </>
        )}
      </button>
    </form>
  );
};

export default FileUpload;
