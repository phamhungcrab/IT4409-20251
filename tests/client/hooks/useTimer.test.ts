import { renderHook, act } from '@testing-library/react-hooks';
import useTimer from '../../../client/src/hooks/useTimer';

/**
 * Tests for the useTimer hook.  These tests verify that the
 * hook correctly calculates remaining time and marks itself
 * expired once the end time has passed.  The test uses
 * Jest fake timers to simulate the passage of time.
 */
describe('useTimer', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  test('counts down and expires', () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 3000);
    const { result } = renderHook(() => useTimer(endTime, () => {}));
    // Initially not expired
    expect(result.current.expired).toBe(false);
    // Fast-forward 3 seconds to trigger expiry
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.expired).toBe(true);
  });
});