/**
 * useExam hook.
 *
 * Manages the state of an exam attempt.  It handles fetching exam
 * metadata and questions, storing the student’s answers, and submitting
 * those answers to the backend.  The hook returns convenient methods to
 * update answers and submit the exam, along with flags indicating
 * loading and error states.  Randomization of questions and options
 * should be performed on the backend; this hook simply consumes the
 * materialized view.  Replace the stubbed API calls with real
 * endpoints when integrating with your server.
 */

import { useEffect, useState } from 'react';
import useApi from './useApi';
import type { OptionItem } from '../components/OptionList';

// Internal types for the exam and question data returned from the API
export interface ExamDetails {
  id: number;
  title: string;
  startTime: string; // ISO string; backend should provide
  endTime: string;   // ISO string
}

export interface ExamQuestion {
  questionId: number;
  orderIndex: number;
  text: string;
  questionType: number;
  options?: OptionItem[];
}

export interface UseExamReturn {
  exam: ExamDetails | null;
  questions: ExamQuestion[];
  answers: Record<number, number[] | string>;
  loading: boolean;
  error: string | null;
  setAnswer: (questionId: number, answer: number[] | string) => void;
  submitExam: () => Promise<void>;
}

/**
 * Hook to manage an exam attempt.  Pass the examId (as a string) to
 * identify which exam to load.  The returned object contains the exam
 * details, list of questions, current answers, and helper functions.
 */
export default function useExam(examId: string | undefined): UseExamReturn {
  const api = useApi();
  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number[] | string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exam details and questions from the API when examId changes
  useEffect(() => {
    if (!examId) return;
    const fetchExam = async () => {
      setLoading(true);
      setError(null);
      try {
        // Example API calls.  Implement these endpoints in your backend.
        // const examData = await api.get<ExamDetails>(`/exams/${examId}`);
        // const questionsData = await api.get<ExamQuestion[]>(`/exams/${examId}/questions`);
        // For now, use sample data to illustrate the structure.
        const now = Date.now();
        const sampleExam: ExamDetails = {
          id: parseInt(examId, 10),
          title: `Exam #${examId}`,
          startTime: new Date(now).toISOString(),
          endTime: new Date(now + 60 * 60 * 1000).toISOString(),
        };
        const sampleQuestions: ExamQuestion[] = [
          {
            questionId: 1,
            orderIndex: 1,
            text: 'What is the capital of France?',
            questionType: 1,
            options: [
              { id: 1, text: 'Berlin' },
              { id: 2, text: 'Madrid' },
              { id: 3, text: 'Paris' },
              { id: 4, text: 'Rome' },
            ],
          },
          {
            questionId: 2,
            orderIndex: 2,
            text: 'Select the colours in the French flag.',
            questionType: 2,
            options: [
              { id: 5, text: 'Red' },
              { id: 6, text: 'Blue' },
              { id: 7, text: 'Green' },
              { id: 8, text: 'White' },
            ],
          },
          {
            questionId: 3,
            orderIndex: 3,
            text: 'Describe your motivation for taking this course.',
            questionType: 3,
          },
        ];
        setExam(sampleExam);
        setQuestions(sampleQuestions);
      } catch (err: any) {
        // Convert error to string for display
        setError(err.message || 'Failed to load exam data.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, api]);

  /**
   * Update the answer state for a given question.  Answers are stored in
   * a keyed object where the questionId is the key.  For objective
   * questions, the value is an array of selected option IDs; for essays
   * it is the typed string.  This function can be passed down to the
   * `QuestionCard` component.
   */
  const setAnswer = (questionId: number, answer: number[] | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  /**
   * Submit the exam.  Sends the answers object to the backend.  You
   * should implement an endpoint like `/exams/{examId}/submit` that
   * accepts the answers and returns a result or confirmation.  This
   * stubbed implementation does nothing and resolves immediately.
   */
  const submitExam = async () => {
    if (!examId) return;
    // Uncomment and implement this when the API is ready:
    // await api.post(`/exams/${examId}/submit`, { answers });
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return {
    exam,
    questions,
    answers,
    loading,
    error,
    setAnswer,
    submitExam,
  };
}