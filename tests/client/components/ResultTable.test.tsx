import { render, screen } from '@testing-library/react';
import ResultTable, { ResultItem } from '../../../client/src/components/ResultTable';
import { BrowserRouter } from 'react-router-dom';

/**
 * Tests for the ResultTable component.  These tests verify
 * that the component renders correctly with and without
 * results and that links to individual results pages are
 * present.  When integrating with real API data, update
 * expectations accordingly.
 */
describe('ResultTable', () => {
  test('renders no results fallback', () => {
    render(
      <BrowserRouter>
        <ResultTable results={[]} />
      </BrowserRouter>
    );
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  test('renders rows for each result', () => {
    const results: ResultItem[] = [
      {
        examId: 1,
        examTitle: 'Midterm 1',
        objectiveScore: 8,
        subjectiveScore: 7,
        totalScore: 15,
        status: 'COMPLETED',
      },
    ];
    render(
      <BrowserRouter>
        <ResultTable results={results} />
      </BrowserRouter>
    );
    expect(screen.getByText(/midterm 1/i)).toBeInTheDocument();
    // There should be a link to view the result details
    expect(screen.getByRole('link', { name: /midterm 1/i })).toHaveAttribute('href', '/results/1');
  });
});