/**
 * monitoringService module.
 *
 * Provides functions for retrieving real-time exam monitoring data and
 * broadcasting announcements.  This includes lists of participants
 * currently taking an exam, their progress and time remaining, and a
 * method for instructors to send announcements to all participants.
 * Endpoint paths are examples; adjust them to match your backend.
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

// Represents the status of a student during an exam.  Extend as needed.
export interface ParticipantStatus {
  studentId: number;
  name: string;
  status: 'online' | 'offline' | 'submitted' | 'expired';
  progress: number; // Percentage of questions answered (0-100)
  timeLeftMs: number; // Milliseconds remaining
}

/**
 * Retrieve the current monitoring snapshot for an exam.  Returns a list
 * of participants with their status, progress and time remaining.  This
 * endpoint should be authorized for instructors/admins only.
 */
export async function getExamParticipants(examId: number): Promise<ParticipantStatus[]> {
  const response = await fetch(`${baseUrl}/monitoring/exams/${examId}/participants`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch participants for exam ${examId}`);
  }
  return (await response.json()) as ParticipantStatus[];
}

/**
 * Get aggregated progress metrics for an exam.  The server should
 * return data such as the number of students online, completed, and
 * average progress.  Adjust the return type to match your API.
 */
export interface ExamProgressSummary {
  onlineCount: number;
  completedCount: number;
  averageProgress: number;
}

export async function getExamProgressSummary(examId: number): Promise<ExamProgressSummary> {
  const response = await fetch(`${baseUrl}/monitoring/exams/${examId}/summary`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch progress summary for exam ${examId}`);
  }
  return (await response.json()) as ExamProgressSummary;
}

/**
 * Broadcast an announcement to all participants of an exam.  Instructors
 * can use this to send messages (e.g. time warnings, corrections) to
 * all connected students.  The backend should push this message via
 * websockets/SignalR to the clients.  Returns void on success.
 */
export async function sendExamAnnouncement(examId: number, message: string): Promise<void> {
  const response = await fetch(`${baseUrl}/monitoring/exams/${examId}/announcements`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to send announcement for exam ${examId}`);
  }
}