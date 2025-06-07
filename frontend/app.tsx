import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
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

        setJobs((prev) => {
          const index = prev.findIndex((j) => j.id === jobId);
          if (index >= 0) {
            const newJobs = [...prev];
            newJobs[index] = job;
            return newJobs;
          } else {
            return [job, ...prev];
          }
        });

        if (job.status === 'processing' || job.status === 'analyzing') {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
        setTimeout(poll, 5000);
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
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-error" />;
      case 'processing':
      case 'analyzing':
        return <RefreshCw className="w-5 h-5 text-info animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-lg text-primary-content">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">AI Media Transcription & Analysis</h1>
          </div>
          <p className="text-base-content/70">
            Upload your audio or video files to get AI-powered transcriptions and intelligent analysis.
          </p>
        </header>

        {error && (
          <div className="alert alert-error shadow-lg mb-6">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Media File
                </h2>
                <FileUpload onUpload={handleFileUpload} isUploading={isUploading} />
              </div>
            </div>

            {currentJob && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h2 className="card-title">
                    <FileText className="w-5 h-5 text-success" />
                    Results
                  </h2>
                  <TranscriptionResults job={currentJob} onReanalyze={handleReanalyze} />
                </div>
              </div>
            )}
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">
                <Clock className="w-5 h-5 text-info" />
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
