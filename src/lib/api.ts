const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('kepler_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('kepler_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('kepler_token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async signup(email: string, password: string, name: string, sectionId: string) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, sectionId }),
    });
    this.setToken(data.token);
    return data;
  }

  async signupTeacher(email: string, password: string, name: string, inviteCode: string) {
    const data = await this.request('/auth/signup/teacher', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, inviteCode }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Sections
  async getSections() {
    return this.request('/sections');
  }

  async createSection(data: any) {
    return this.request('/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignTeacher(sectionId: string, teacherId: string) {
    return this.request(`/sections/${sectionId}/assign-teacher`, {
      method: 'POST',
      body: JSON.stringify({ teacherId }),
    });
  }

  // Jobs
  async getJobs() {
    return this.request('/jobs');
  }

  async createJob(data: any) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: string, data: any) {
    return this.request(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Submissions
  async getSubmissions() {
    return this.request('/submissions');
  }

  async createSubmission(data: any) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubmissionGrade(id: string, data: any) {
    return this.request(`/submissions/${id}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getTopCandidates(jobId: string, submissionNumber?: number, limit?: number) {
    const params = new URLSearchParams({ jobId });
    if (submissionNumber) params.append('submissionNumber', submissionNumber.toString());
    if (limit) params.append('limit', limit.toString());
    return this.request(`/submissions/top-candidates?${params}`);
  }

  // Checklists
  async getChecklists() {
    return this.request('/checklists');
  }

  async createChecklist(data: any) {
    return this.request('/checklists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Invites
  async getInvites() {
    return this.request('/invites');
  }

  async createInvites(emails: string[]) {
    return this.request('/invites', {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  }

  async verifyInvite(code: string, email: string) {
    return this.request('/invites/verify', {
      method: 'POST',
      body: JSON.stringify({ code, email }),
    });
  }

  // Stats
  async getStats() {
    return this.request('/stats');
  }
}

export const api = new ApiClient();
