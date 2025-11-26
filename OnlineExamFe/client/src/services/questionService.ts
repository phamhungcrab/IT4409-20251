/**
 * questionService module.
 *
 * Provides functions for managing questions.
 */

import apiClient from '../utils/apiClient';

export enum QuestionDifficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3,
  VeryHard = 4
}

export enum QuestionType {
  SINGLE_CHOICE = 0,
  MULTIPLE_CHOICE = 1
}

export interface Question {
  id: number;
  content: string;
  answer: string;
  point: number;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  subjectId: number;
  chapter: number;
}

export interface CreateQuestionDto {
  content: string;
  answer: string;
  point: number;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  subjectId: number;
  chapter?: number;
}

export interface UpdateQuestionDto {
  id: number;
  content: string;
  answer: string;
  point: number;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  subjectId: number;
  chapter?: number;
}

export const questionService = {
  getAllQuestions: async (): Promise<Question[]> => {
    return await apiClient.get<Question[]>('/api/Question/get-all') as unknown as Promise<Question[]>;
  },

  getQuestionById: async (id: number): Promise<Question> => {
    return await apiClient.get<Question>(`/api/Question/${id}`) as unknown as Promise<Question>;
  },

  createQuestion: async (data: CreateQuestionDto): Promise<void> => {
    return await apiClient.post<void>('/api/Question/create-question', data) as unknown as Promise<void>;
  },

  updateQuestion: async (data: UpdateQuestionDto): Promise<void> => {
    return await apiClient.put<void>('/api/Question/update-question', data) as unknown as Promise<void>;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    return await apiClient.delete<void>(`/api/Question/${id}`) as unknown as Promise<void>;
  },

  importQuestions: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    // Use axios directly or apiClient with override if needed for FormData
    // apiClient handles Content-Type: application/json by default, but axios detects FormData
    return await apiClient.post<void>('/api/Question/import-question', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as unknown as Promise<void>;
  }
};