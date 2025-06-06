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
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getJobStatus(jobId: number): Promise<TranscriptionJob> {
    return this.request<TranscriptionJob>(`/job/${jobId}`);
  }

  async reanalyzeJob(jobId: number, prompt: string): Promise<void> {
    await this.request(`/job/${jobId}/reanalyze`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async listJobs(skip: number = 0, limit: number = 100): Promise<TranscriptionJob[]> {
    return this.request<TranscriptionJob[]>(`/jobs?skip=${skip}&limit=${limit}`);
  }
}

const apiService = new ApiService();

export const uploadFile = apiService.uploadFile.bind(apiService);
export const getJobStatus = apiService.getJobStatus.bind(apiService);
export const reanalyzeJob = apiService.reanalyzeJob.bind(apiService);
export const listJobs = apiService.listJobs.bind(apiService);