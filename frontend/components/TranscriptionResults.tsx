// src/components/TranscriptionResults.tsx
import React, { useState } from 'react';
import { FileText, Brain, Edit2, Copy, Check } from 'lucide-react';
import { TranscriptionJob } from '../types/api';

interface TranscriptionResultsProps {
  job: TranscriptionJob;
  onReanalyze: (jobId: number, newPrompt: string) => void;
}

const TranscriptionResults: React.FC<TranscriptionResultsProps> = ({
  job,
  onReanalyze,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPrompt, setNewPrompt] = useState(job.analysis_prompt);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);

  const handleReanalyze = () => {
    if (newPrompt.trim() !== job.analysis_prompt) {
      onReanalyze(job.id, newPrompt.trim());
    }
    setIsEditing(false);
  };

  const copyToClipboard = async (text: string, type: 'transcript' | 'analysis') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'transcript') {
        setCopiedTranscript(true);
        setTimeout(() => setCopiedTranscript(false), 2000);
      } else {
        setCopiedAnalysis(true);
        setTimeout(() => setCopiedAnalysis(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (job.status === 'failed') {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">
          <FileText className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Processing Failed</p>
        </div>
        {job.error_message && (
          <p className="text-sm text-gray-600">{job.error_message}</p>
        )}
      </div>
    );
  }

  if (job.status === 'processing' || job.status === 'analyzing') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">
          {job.status === 'processing' ? 'Transcribing audio...' : 'Analyzing content...'}
        </p>
      </div>
    );
  }

  if (!job.transcript) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2" />
        <p>No results yet. Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transcript Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-medium">Transcript</h3>
          </div>
          <button
            onClick={() => copyToClipboard(job.transcript!, 'transcript')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            {copiedTranscript ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <Copy className="w-4 h-4 mr-1" />
            )}
            {copiedTranscript ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {job.transcript}
          </p>
        </div>
      </div>

      {/* Analysis Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="font-medium">Analysis</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Prompt
            </button>
            {job.analysis_result && (
              <button
                onClick={() => copyToClipboard(job.analysis_result!, 'analysis')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                {copiedAnalysis ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copiedAnalysis ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        {/* Analysis Prompt Editor */}
        {isEditing && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Prompt
            </label>
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReanalyze}
                disabled={!newPrompt.trim()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Re-analyze
              </button>
            </div>
          </div>
        )}

        {/* Analysis Result */}
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          {job.analysis_result ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {job.analysis_result}
            </p>
          ) : (
            <p className="text-gray-500 italic">Analysis in progress...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResults;
