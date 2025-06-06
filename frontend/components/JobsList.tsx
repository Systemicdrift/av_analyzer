
// src/components/JobsList.tsx
import React from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { TranscriptionJob } from '../types/api';

interface JobsListProps {
  jobs: TranscriptionJob[];
  onJobSelect: (job: TranscriptionJob) => void;
  onReanalyze: (jobId: number, newPrompt: string) => void;
}

const JobsList: React.FC<JobsListProps> = ({ jobs, onJobSelect, onReanalyze }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
      case 'analyzing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No jobs yet. Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          onClick={() => onJobSelect(job)}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {getStatusIcon(job.status)}
              <span className="font-medium text-gray-900">
                {job.filename}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {job.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {job.analysis_prompt}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(job.created_at)}
            </p>
          </div>

          {job.status === 'completed' && (
            <div className="flex space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Complete
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default JobsList;