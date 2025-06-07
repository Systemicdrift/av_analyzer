// src/components/TranscriptionResults.tsx
import React, { useState } from 'react';
import { FileText, Brain, Edit2, Copy, Check } from 'lucide-react';
import { TranscriptionJob } from '../types/api';

interface TranscriptionResultsProps {
  job: TranscriptionJob;
  onReanalyze: (jobId: number, newPrompt: string) => void;
}

const TranscriptionResults: React.FC<TranscriptionResultsProps> = ({ job, onReanalyze }) => {
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
      <div className="text-center text-error">
        <FileText className="mx-auto" />
        <p className="font-semibold">Processing Failed</p>
        {job.error_message && <p>{job.error_message}</p>}
      </div>
    );
  }

  if (job.status === 'processing' || job.status === 'analyzing') {
    return (
      <div className="text-center text-base-content">
        <div className="animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p>
          {job.status === 'processing' ? 'Transcribing audio...' : 'Analyzing content...'}
        </p>
      </div>
    );
  }

  if (!job.transcript) {
    return (
      <div className="text-center text-base-content">
        <FileText className="mx-auto" />
        <p>No results yet. Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transcript Section */}
      <div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" />
            <h3 className="font-semibold">Transcript</h3>
          </div>
          <button
            onClick={() => copyToClipboard(job.transcript!, 'transcript')}
            className="btn btn-sm btn-ghost"
          >
            {copiedTranscript ? (
              <>
                <Check className="mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-base-200 rounded-xl overflow-y-auto">
          <p className="whitespace-pre-wrap">{job.transcript}</p>
        </div>
      </div>

      {/* Analysis Section */}
      <div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Brain className="text-secondary" />
            <h3 className="font-semibold">Analysis</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-sm btn-outline btn-neutral"
            >
              <Edit2 className="mr-1" />
              Edit Prompt
            </button>
            {job.analysis_result && (
              <button
                onClick={() => copyToClipboard(job.analysis_result!, 'analysis')}
                className="btn btn-sm btn-ghost"
              >
                {copiedAnalysis ? (
                  <>
                    <Check className="mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="bg-base-200 rounded-xl">
            <label className="block font-medium">Analysis Prompt</label>
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleReanalyze}
                disabled={!newPrompt.trim()}
                className="btn btn-sm btn-primary"
              >
                Re-analyze
              </button>
            </div>
          </div>
        )}

        <div className="bg-base-200 rounded-xl overflow-y-auto">
          {job.analysis_result ? (
            <p className="whitespace-pre-wrap">{job.analysis_result}</p>
          ) : (
            <p className="italic">Analysis in progress...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionResults;
