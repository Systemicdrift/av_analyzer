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
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <File className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-700">{selectedFile.name}</p>
              <p className="text-sm text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-1 hover:bg-red-100 rounded"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your media file here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports MP3, MP4, WAV, M4A, FLAC files
            </p>
          </div>
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
          className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Choose File
        </button>
      )}

      {/* Analysis Prompt */}
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Analysis Prompt
        </label>
        <textarea
          id="prompt"
          value={analysisPrompt}
          onChange={(e) => setAnalysisPrompt(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Describe how you want the AI to analyze the transcribed content..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!selectedFile || !analysisPrompt.trim() || isUploading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload & Analyze
          </>
        )}
      </button>
    </form>
  );
};

export default FileUpload;