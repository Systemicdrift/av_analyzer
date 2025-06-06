// src/App.tsx
import React, { useState, useCallback } from 'react';
import { Upload, FileText, Brain, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import FileUpload from './components/FileUpload';
import TranscriptionResults from './components/TranscriptionResults';
import JobsList from './components/JobsList';
import { TranscriptionJob, UploadResponse } from './types/api';
import { uploadFile, getJobStatus, reanalyzeJob } from './types/api';
import './index.css';

const App: React.FC = () => {
  const [currentJob, setCurrentJob] = useState<TranscriptionJob | null>(null);
  const [jobs, setJobs] = useState<TranscriptionJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File, analysisPrompt: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const response: UploadResponse = await uploadFile(file, analysisPrompt);
      setCurrentJob(response);

      // Start polling for job completion
      pollJobStatus(response.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const pollJobStatus = useCallback(async (jobId: number) => {
    const poll = async () => {
      try {
        const job = await getJobStatus(jobId);
        setCurrentJob(job);

        // Update jobs list
        setJobs(prev => {
          const index = prev.findIndex(j => j.id === jobId);
          if (index >= 0) {
            const newJobs = [...prev];
            newJobs[index] = job;
            return newJobs;
          } else {
            return [job, ...prev];
          }
        });

        // Continue polling if job is still processing
        if (job.status === 'processing' || job.status === 'analyzing') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
        setTimeout(poll, 5000); // Retry in 5 seconds on error
      }
    };

    poll();
  }, []);

  const handleReanalyze = async (jobId: number, newPrompt: string) => {
    try {
      await reanalyzeJob(jobId, newPrompt);
      pollJobStatus(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Re-analysis failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'analyzing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Media Transcription & Analysis
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your audio or video files to get AI-powered transcriptions and intelligent analysis
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Media File
              </h2>
              <FileUpload
                onUpload={handleFileUpload}
                isUploading={isUploading}
              />
            </div>

            {/* Current Job Results */}
            {currentJob && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Results
                </h2>
                <TranscriptionResults
                  job={currentJob}
                  onReanalyze={handleReanalyze}
                />
              </div>
            )}
          </div>

          {/* Jobs List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Jobs
              </h2>
              <JobsList
                jobs={jobs}
                onJobSelect={setCurrentJob}
                currentJobId={currentJob?.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
