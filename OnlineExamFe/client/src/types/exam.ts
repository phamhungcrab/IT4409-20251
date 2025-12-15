/**
 * Common Type Definitions for Exam System.
 * Standardizes types across Student, Teacher, and Admin views.
 */

export interface ExamDto {
  id: number;
  name: string; // Unified: name (was sometimes title)
  durationMinutes: number; // Unified: durationMinutes (was duration)
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status?: string;   // Optional view status (e.g. Scheduled, Ongoing)
  classId?: number;  // Optional class linkage
  createBy?: number; // Teacher ID
  subjectId?: number;
  blueprintId?: number;
}

export interface UpcomingExamDto {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
}

export interface GeneratedQuestionDto {
  id: number;
  order: number;
  content: string;
  cleanAnswer: string[];
  correctOptionIds?: number[];
  type: number;
  difficulty: number;
  point: number;
  chapter: number;
  imageUrl?: string;
}

export interface ExamGenerateResultDto {
  examId: number;
  name: string;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  classId: number;
  blueprintId?: number;
  questions: GeneratedQuestionDto[];
}
