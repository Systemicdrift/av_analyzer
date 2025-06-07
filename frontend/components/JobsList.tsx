// src/components/JobsList.tsx
import React from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { TranscriptionJob } from '../types/api';

interface JobsListProps {
  jobs: TranscriptionJob[];
  onJobSelect: (job: TranscriptionJob) => void;
  onReanalyze: (jobId: number, newPrompt: string) => void;
}

const JobsList: React.FC<JobsListProps> = ({ jobs, onJobSelect }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-success" />;
      case 'failed':
        return <XCircle className="text-error" />;
      case 'processing':
      case 'analyzing':
        return <RefreshCw className="text-primary animate-spin" />;
      default:
        return <Clock className="text-base-content" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center text-base-content">
        <p>No jobs yet. Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => onJobSelect(job)}
          className="card border border-base-200 hover:bg-base-100 cursor-pointer"
        >
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                <span className="font-medium">{job.filename}</span>
                <span className="text-xs text-base-content capitalize">{job.status}</span>
              </div>
              <p className="text-sm text-base-content">{job.analysis_prompt}</p>
              <p className="text-xs text-base-content">{formatDate(job.created_at)}</p>
            </div>

            {job.status === 'completed' && (
              <div className="badge badge-success badge-outline text-xs">Complete</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobsList;
