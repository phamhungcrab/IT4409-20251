/**
 * resultService module.
 *
 * Handles operations related to exam results.  Use this service to
 * retrieve a list of results for the current user, fetch detailed
 * information for a specific result, or export results for reporting.
 * The functions rely on the native `fetch` API and include the JWT
 * token stored in localStorage.  Adjust endpoint paths and return
 * types to match your backend implementation.
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

// Defines the shape of a result row.  Mirror this with your API response.
export interface ResultSummary {
  id: number;
  examTitle: string;
  objectiveScore: number;
  subjectiveScore: number;
  totalScore: number;
  status: string;
}

// Detailed result includes per-question breakdown.  Adjust fields as needed.
export interface ResultDetail extends ResultSummary {
  answers: {
    questionId: number;
    questionText: string;
    questionType: number;
    selectedOptions?: number[];
    essayAnswer?: string;
    correctOptions?: number[];
    score: number;
  }[];
}

/**
 * Fetch a list of all exam results visible to the current user.  For a
 * student, this will be their own results; for an instructor/admin,
 * this may include multiple students.  Supports optional query
 * parameters (e.g. pagination, date range) via the `params` object.
 */
export async function getResults(params?: Record<string, string | number>): Promise<ResultSummary[]> {
  const query = params
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : '';
  const response = await fetch(`${baseUrl}/results${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }
  return (await response.json()) as ResultSummary[];
}

/**
 * Fetch detailed information for a single result.  Returns per-question
 * breakdown including student answers and scores.  Throws an error if
 * the result cannot be retrieved.
 */
export async function getResultById(id: number): Promise<ResultDetail> {
  const response = await fetch(`${baseUrl}/results/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch result ${id}`);
  }
  return (await response.json()) as ResultDetail;
}

/**
 * Export exam results to a file (e.g. CSV or Excel).  Sends a GET
 * request with appropriate query parameters and returns a Blob.  The
 * caller can then create a URL and prompt the user to download it.
 * Adjust the endpoint and parameters based on your server's implementation.
 */
export async function exportResults(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
  const response = await fetch(`${baseUrl}/results/export?format=${format}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      // Indicate that we expect a binary response
      Accept: 'application/octet-stream',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to export results');
  }
  return await response.blob();
}