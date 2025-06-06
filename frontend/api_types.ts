// src/types/api.ts
export interface TranscriptionJob {
  id: number;
  filename: string;
  file_hash: string;
  status: 'pending' | 'processing' | 'analyzing' | 'completed' | 'failed';
  transcript?: string;
  analysis_prompt: string;
  analysis_result?: string;
  error_message?: string;
  file_size?: number;
  duration?: number;
  created_at: string;
  updated_at?: string;
}

export interface UploadResponse extends TranscriptionJob {}

export interface AnalysisRequest {
  prompt: string;
}

export interface ApiError {
  detail: string;
}

// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async uploadFile(file: File, analysisPrompt: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysis_prompt', analysisPrompt);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return this.handleResponse<UploadResponse>(response);
  }

  async getJobStatus(jobId: number): Promise<TranscriptionJob> {
    const response = await fetch(`${API_BASE_URL}/job/${jobId}`);
    return this.handleResponse<TranscriptionJob>(response);
  }

  async reanalyzeJob(jobId: number, prompt: string): Promise<{ message: string; job_id: number }> {
    const response = await fetch(`${API_BASE_URL}/job/${jobId}/reanalyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    return this.handleResponse<{ message: string; job_id: number }>(response);
  }

  async listJobs(skip: number = 0, limit: number = 100): Promise<TranscriptionJob[]> {
    const response = await fetch(`${API_BASE_URL}/jobs?skip=${skip}&limit=${limit}`);
    return this.handleResponse<TranscriptionJob[]>(response);
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse<{ status: string }>(response);
  }
}

const apiService = new ApiService();

export const {
  uploadFile,
  getJobStatus,
  reanalyzeJob,
  listJobs,
  healthCheck
} = apiService;
