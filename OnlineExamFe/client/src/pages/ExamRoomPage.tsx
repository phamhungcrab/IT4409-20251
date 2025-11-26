/**
 * ExamRoomPage component.
 *
 * This page renders the exam experience for a student.  It fetches (or
 * synthesizes) exam details and questions based on the `examId` route
 * parameter, displays the exam title and a countdown timer, presents each
 * question via the `QuestionCard` component, and collects answers in
 * component state.  When the timer expires or the user submits the exam,
 * the answers are sent to the backend (stubbed here) and the user is
 * redirected to the results page.  Randomization and autosave logic
 * would normally be handled by a custom hook (e.g. useExam) or service.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import type { OptionItem } from '../components/OptionList';

// Internal type definitions for exam and question objects.  In a real
// implementation these would be defined in a shared model library and
// include additional metadata (e.g. subject, class association).
interface ExamInfo {
  id: number;
  title: string;
  endTime: Date;
}

interface ExamQuestion {
  questionId: number;
  orderIndex: number;
  text: string;
  questionType: number;
  options?: OptionItem[];
}

const ExamRoomPage: React.FC = () => {
  // Extract the exam identifier from the URL (e.g. /exam/123).  React
  // Router provides params as strings, so convert to number where needed.
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number[] | string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exam details and questions on initial render or when examId changes.
  useEffect(() => {
    if (!examId) return;
    const id = parseInt(examId, 10);
    // Stubbed exam data.  Replace with API call to fetch exam info.
    const now = Date.now();
    const end = new Date(now + 60 * 60 * 1000); // 1 hour from now
    setExam({ id, title: `Exam #${id}`, endTime: end });

    // Stubbed question list.  In practice, these would be materialized
    // snapshots (QuestionExam records) retrieved from the backend, already
    // randomized per student.  The questionType codes map to:
    // 1 = SINGLE_CHOICE, 2 = MULTI_CHOICE, 3 = ESSAY.
    const sampleQuestions: ExamQuestion[] = [
      {
        questionId: 1,
        orderIndex: 1,
        text: 'What is 2 + 2?',
        questionType: 1,
        options: [
          { id: 1, text: '3' },
          { id: 2, text: '4' },
          { id: 3, text: '5' },
          { id: 4, text: '6' },
        ],
      },
      {
        questionId: 2,
        orderIndex: 2,
        text: 'Select the prime numbers.',
        questionType: 2,
        options: [
          { id: 5, text: '2' },
          { id: 6, text: '3' },
          { id: 7, text: '4' },
          { id: 8, text: '5' },
        ],
      },
      {
        questionId: 3,
        orderIndex: 3,
        text: 'Explain the significance of UTC in distributed systems.',
        questionType: 3,
      },
    ];
    setQuestions(sampleQuestions);
  }, [examId]);

  /**
   * Update the answer state when a question's answer changes.  The
   * `QuestionCard` component calls this callback with either an array of
   * selected option IDs or an essay string depending on the question type.
   */
  const handleAnswerChange = (questionId: number, answer: number[] | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  /**
   * Submit the exam.  This stub collects the answers and would normally
   * send them to the backend via an API call (e.g. examService.submit).
   * After submission, redirect to the results page for this exam.
   */
  const submitExam = async () => {
    if (!exam) return;
    setIsSubmitting(true);
    try {
      // Simulate network delay.  Replace with a real submission.
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Submitted answers:', answers);
      // Redirect to the results page after submission.  The base path is
      // `/results`; if you add per-exam result pages in the future, append
      // the examId (e.g. `/results/${exam.id}`).
      navigate('/results');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Called when the countdown timer reaches zero.  Automatically submits
   * the exam so that answers are not lost.  You might also display a
   * notification or modal here to inform the user.
   */
  const handleExpire = () => {
    submitExam();
  };

  if (!exam) {
    // Show a loading state while exam details are being prepared
    return <p className="p-4">Loading exam...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header with exam title and countdown timer */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{exam.title}</h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Time Left:</span>
          <Timer endTime={exam.endTime} onExpire={handleExpire} />
        </div>
      </header>

      {/* Render each question */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitExam();
        }}
        className="space-y-4"
      >
        {questions.map((q) => (
          <QuestionCard
            key={q.questionId}
            questionId={q.questionId}
            orderIndex={q.orderIndex}
            text={q.text}
            questionType={q.questionType}
            options={q.options}
            selectedOptions={Array.isArray(answers[q.questionId]) ? (answers[q.questionId] as number[]) : []}
            onAnswer={(answer) => handleAnswerChange(q.questionId, answer)}
          />
        ))}

        {/* Submit button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamRoomPage;