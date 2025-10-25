/**
 * questionService module.
 *
 * Provides functions to interact with the question management endpoints of
 * the backend.  Each function sends an HTTP request using the native
 * `fetch` API.  The current JWT token is read from localStorage and
 * included in the `Authorization` header if present.  Adjust the
 * endpoint paths to match your API routes (e.g. `/questions` versus
 * `/api/questions`).  Functions throw an error when the HTTP response
 * status is not successful.  You can extend this file with additional
 * operations like bulk import/export if needed.
 */

// Base URL for API requests (e.g. http://localhost:5000/api)
const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';

// Helper to add Authorization header from localStorage token
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Question DTO types for type safety; adjust fields according to your schema
export interface QuestionPayload {
  subjectId: number;
  text: string;
  questionType: number; // 1 = SINGLE_CHOICE, 2 = MULTI_CHOICE, 3 = ESSAY
  options?: { text: string; isCorrect?: boolean }[];
}

export interface QuestionResponse {
  id: number;
  subjectId: number;
  text: string;
  questionType: number;
  options?: { id: number; text: string }[];
}

export async function getQuestions(): Promise<QuestionResponse[]> {
  const response = await fetch(`${baseUrl}/questions`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return (await response.json()) as QuestionResponse[];
}

export async function getQuestion(id: number): Promise<QuestionResponse> {
  const response = await fetch(`${baseUrl}/questions/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch question ${id}`);
  }
  return (await response.json()) as QuestionResponse;
}

export async function createQuestion(payload: QuestionPayload): Promise<QuestionResponse> {
  const response = await fetch(`${baseUrl}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || 'Failed to create question');
  }
  return (await response.json()) as QuestionResponse;
}

export async function updateQuestion(id: number, payload: Partial<QuestionPayload>): Promise<QuestionResponse> {
  const response = await fetch(`${baseUrl}/questions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update question ${id}`);
  }
  return (await response.json()) as QuestionResponse;
}

export async function deleteQuestion(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to delete question ${id}`);
  }
}