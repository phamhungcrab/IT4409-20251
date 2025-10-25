/**
 * examService module.
 *
 * Contains functions for managing exams and exam attempts.  These
 * functions interact with the backend using the native `fetch` API.  The
 * current authentication token is read from localStorage and included
 * automatically.  Adjust the API endpoint paths and payload shapes to
 * align with your server.  Functions throw an error on unsuccessful
 * responses.
 */

const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Data shapes for exam operations.  Expand as your schema evolves.
export interface ExamPayload {
  title: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  questionIds: number[]; // Ids of questions to include
  classIds?: number[];   // Classes assigned to this exam
  individualStudentIds?: number[]; // Optional list of individual student assignments
}

export interface ExamResponse {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
}

export async function getExams(): Promise<ExamResponse[]> {
  const response = await fetch(`${baseUrl}/exams`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch exams');
  }
  return (await response.json()) as ExamResponse[];
}

export async function getExam(id: number): Promise<ExamResponse> {
  const response = await fetch(`${baseUrl}/exams/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch exam ${id}`);
  }
  return (await response.json()) as ExamResponse;
}

export async function createExam(payload: ExamPayload): Promise<ExamResponse> {
  const response = await fetch(`${baseUrl}/exams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create exam');
  }
  return (await response.json()) as ExamResponse;
}

export async function updateExam(id: number, payload: Partial<ExamPayload>): Promise<ExamResponse> {
  const response = await fetch(`${baseUrl}/exams/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update exam ${id}`);
  }
  return (await response.json()) as ExamResponse;
}

export async function deleteExam(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/exams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to delete exam ${id}`);
  }
}

/**
 * Assign classes or individual students to an existing exam.  Sends a
 * POST request to `/exams/{id}/assign`.  The payload can include
 * classIds and/or individualStudentIds; at least one must be provided.
 */
export async function assignExam(id: number, payload: { classIds?: number[]; individualStudentIds?: number[] }): Promise<void> {
  const response = await fetch(`${baseUrl}/exams/${id}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to assign exam ${id}`);
  }
}

/**
 * Submit exam answers.  Sends a POST request to `/exams/{id}/submit`.
 * Answers should be a record keyed by questionId with either an array
 * of option IDs or a string for essays.  The backend should validate
 * and grade the submission accordingly.
 */
export async function submitExam(id: number, answers: Record<number, number[] | string>): Promise<void> {
  const response = await fetch(`${baseUrl}/exams/${id}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to submit exam ${id}`);
  }
}

/**
 * Retrieve a list of exam results for the current user.  Returns an
 * array of objects containing exam title, scores and statuses.  Adjust
 * the endpoint and return type to match your API contract.
 */
export interface ExamResult {
  id: number;
  examTitle: string;
  objectiveScore: number;
  subjectiveScore: number;
  totalScore: number;
  status: string;
}

export async function getResults(): Promise<ExamResult[]> {
  const response = await fetch(`${baseUrl}/results`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch exam results');
  }
  return (await response.json()) as ExamResult[];
}