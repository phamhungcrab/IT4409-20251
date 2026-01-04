import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type IntegrityAlertKind = 'focus-loss' | 'left-page';
type FullscreenGateReason = 'required' | 'exit';
type FocusLossSource = 'visibility' | 'window';
type LeaveSource = 'pagehide' | 'beforeunload' | 'route-change' | 'manual';

interface IntegrityAlert {
  kind: IntegrityAlertKind;
  occurredAt: number;
  durationMs?: number;
  source?: FocusLossSource;
}

interface IntegrityStats {
  violationCount: number;
  focusLossCount: number;
  leftPageCount: number;
  fullscreenExitCount: number;
  totalFocusLossMs: number;
  lastFocusLossMs: number;
  lastViolationAt: number | null;
}

interface UseExamIntegrityOptions {
  examId?: string | number;
  enabled?: boolean;
  focusLossThresholdMs?: number;
  warnCooldownMs?: number;
  requireFullscreen?: boolean;
  debug?: boolean;
}

interface UseExamIntegrityResult {
  stats: IntegrityStats;
  activeAlert: IntegrityAlert | null;
  fullscreenGate: FullscreenGateReason | null;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  clearAlert: () => void;
  requestFullscreen: () => Promise<void>;
  markLeftPage: (source?: LeaveSource) => void;
}

const DEFAULT_STATS: IntegrityStats = {
  violationCount: 0,
  focusLossCount: 0,
  leftPageCount: 0,
  fullscreenExitCount: 0,
  totalFocusLossMs: 0,
  lastFocusLossMs: 0,
  lastViolationAt: null,
};

const readStats = (storageKey: string): IntegrityStats => {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw) as Partial<IntegrityStats>;
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return DEFAULT_STATS;
  }
};

export const useExamIntegrity = ({
  examId,
  enabled = true,
  focusLossThresholdMs = 5000,
  warnCooldownMs = 2000,
  requireFullscreen = true,
  debug = false,
}: UseExamIntegrityOptions): UseExamIntegrityResult => {
  const storageKey = useMemo(
    () => (examId ? `exam_${examId}_integrity` : 'exam_integrity'),
    [examId]
  );
  const leftPageKey = useMemo(() => `${storageKey}_left_page`, [storageKey]);

  const [stats, setStats] = useState<IntegrityStats>(() => readStats(storageKey));
  const [activeAlert, setActiveAlert] = useState<IntegrityAlert | null>(null);
  const [fullscreenGate, setFullscreenGate] = useState<FullscreenGateReason | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return Boolean(document.fullscreenElement);
  });

  const isFullscreenSupported = typeof document !== 'undefined' &&
    Boolean(document.documentElement?.requestFullscreen);

  const debugLog = useCallback((event: string, payload?: Record<string, unknown>) => {
    if (!debug) return;
    console.log('[exam-integrity]', { event, ...payload });
  }, [debug]);

  const lastAlertAtRef = useRef<number>(0);
  const queuedAlertRef = useRef<IntegrityAlert | null>(null);
  const fullscreenGateRef = useRef<FullscreenGateReason | null>(null);
  const focusLossStartedAtRef = useRef<number | null>(null);
  const focusLossTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusLossViolationTriggeredRef = useRef(false);
  const guardActiveRef = useRef(false);
  const wasFullscreenRef = useRef(isFullscreen);
  const leftPageRecordedRef = useRef(false);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    fullscreenGateRef.current = fullscreenGate;
  }, [fullscreenGate]);

  useEffect(() => {
    if (!enabled) return;
    setStats(readStats(storageKey));
  }, [enabled, storageKey]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    leftPageRecordedRef.current = false;
  }, [enabled, examId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(stats));
    } catch {}
  }, [stats, storageKey]);

  const recordViolation = useCallback((
    update: (prev: IntegrityStats) => IntegrityStats,
    event: string,
    payload?: Record<string, unknown>
  ) => {
    setStats((prev) => {
      const next = update(prev);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
    debugLog(event, payload);
  }, [debugLog, storageKey]);

  const triggerAlert = useCallback((alert: IntegrityAlert) => {
    const now = Date.now();
    if (now - lastAlertAtRef.current < warnCooldownMs) {
      debugLog('alert_skipped', { reason: 'cooldown', alert });
      return;
    }

    if (fullscreenGateRef.current) {
      queuedAlertRef.current = alert;
      debugLog('alert_queued', { alert });
      return;
    }

    setActiveAlert(alert);
    lastAlertAtRef.current = now;
  }, [debugLog, warnCooldownMs]);

  const clearAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const clearFocusLossTimer = useCallback(() => {
    if (focusLossTimerRef.current) {
      clearTimeout(focusLossTimerRef.current);
      focusLossTimerRef.current = null;
    }
  }, []);

  const registerFocusLossViolation = useCallback((durationMs: number, source: FocusLossSource) => {
    if (focusLossViolationTriggeredRef.current) return;

    focusLossViolationTriggeredRef.current = true;
    recordViolation(
      (prev) => ({
        ...prev,
        violationCount: prev.violationCount + 1,
        focusLossCount: prev.focusLossCount + 1,
        lastViolationAt: Date.now(),
      }),
      'focus_loss_violation',
      { durationMs, source }
    );

    triggerAlert({
      kind: 'focus-loss',
      occurredAt: Date.now(),
      durationMs,
      source,
    });
  }, [recordViolation, triggerAlert]);

  const beginFocusLoss = useCallback((source: FocusLossSource) => {
    if (!guardActiveRef.current) return;
    if (focusLossStartedAtRef.current) return;

    focusLossStartedAtRef.current = Date.now();
    focusLossViolationTriggeredRef.current = false;
    clearFocusLossTimer();

    focusLossTimerRef.current = setTimeout(() => {
      const startedAt = focusLossStartedAtRef.current;
      if (!startedAt) return;
      const durationMs = Date.now() - startedAt;
      if (durationMs >= focusLossThresholdMs) {
        registerFocusLossViolation(durationMs, source);
      }
    }, focusLossThresholdMs);

    debugLog('focus_loss_start', { source });
  }, [clearFocusLossTimer, debugLog, focusLossThresholdMs, registerFocusLossViolation]);

  const endFocusLoss = useCallback((source: FocusLossSource) => {
    if (!focusLossStartedAtRef.current) return;

    const durationMs = Date.now() - focusLossStartedAtRef.current;
    focusLossStartedAtRef.current = null;
    clearFocusLossTimer();

    recordViolation(
      (prev) => ({
        ...prev,
        totalFocusLossMs: prev.totalFocusLossMs + durationMs,
        lastFocusLossMs: durationMs,
      }),
      'focus_loss_end',
      { durationMs, source }
    );

    if (durationMs >= focusLossThresholdMs) {
      registerFocusLossViolation(durationMs, source);
      setActiveAlert((prev) =>
        prev?.kind === 'focus-loss' ? { ...prev, durationMs } : prev
      );
    }
  }, [clearFocusLossTimer, focusLossThresholdMs, recordViolation, registerFocusLossViolation]);

  useEffect(() => {
    if (!enabled) return;

    const guardActive =
      enabled && (!requireFullscreen || isFullscreen || !isFullscreenSupported);
    guardActiveRef.current = guardActive;

    if (!guardActive) {
      focusLossStartedAtRef.current = null;
      clearFocusLossTimer();
    }
  }, [clearFocusLossTimer, enabled, isFullscreen, isFullscreenSupported, requireFullscreen]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        beginFocusLoss('visibility');
      } else {
        endFocusLoss('visibility');
      }
    };

    const handleBlur = () => beginFocusLoss('window');
    const handleFocus = () => endFocusLoss('window');

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearFocusLossTimer();
    };
  }, [beginFocusLoss, clearFocusLossTimer, endFocusLoss, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const nowFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(nowFullscreen);

      if (!requireFullscreen || !isFullscreenSupported) {
        wasFullscreenRef.current = nowFullscreen;
        return;
      }

      if (!nowFullscreen) {
        const wasFullscreen = wasFullscreenRef.current;
        setFullscreenGate(wasFullscreen ? 'exit' : 'required');

        if (wasFullscreen) {
          recordViolation(
            (prev) => ({
              ...prev,
              violationCount: prev.violationCount + 1,
              fullscreenExitCount: prev.fullscreenExitCount + 1,
              lastViolationAt: Date.now(),
            }),
            'fullscreen_exit',
            { hadFullscreen: wasFullscreen }
          );
        }
      } else {
        setFullscreenGate(null);
      }

      wasFullscreenRef.current = nowFullscreen;
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [enabled, isFullscreenSupported, recordViolation, requireFullscreen]);

  useEffect(() => {
    if (!enabled || !requireFullscreen || !isFullscreenSupported) return;
    if (!isFullscreen) {
      setFullscreenGate((prev) => prev ?? 'required');
    } else {
      setFullscreenGate(null);
    }
  }, [enabled, isFullscreen, isFullscreenSupported, requireFullscreen]);

  const markLeftPage = useCallback((source: LeaveSource = 'manual') => {
    if (!enabledRef.current || leftPageRecordedRef.current) return;
    leftPageRecordedRef.current = true;

    recordViolation(
      (prev) => ({
        ...prev,
        violationCount: prev.violationCount + 1,
        leftPageCount: prev.leftPageCount + 1,
        lastViolationAt: Date.now(),
      }),
      'left_page',
      { source }
    );

    try {
      sessionStorage.setItem(leftPageKey, String(Date.now()));
    } catch {}
  }, [leftPageKey, recordViolation]);

  useEffect(() => {
    if (!enabled) return;

    const storedLeftPage = sessionStorage.getItem(leftPageKey);
    if (storedLeftPage) {
      sessionStorage.removeItem(leftPageKey);
      triggerAlert({
        kind: 'left-page',
        occurredAt: Number(storedLeftPage) || Date.now(),
      });
    }
  }, [enabled, leftPageKey, triggerAlert]);

  useEffect(() => {
    if (!enabled) return;

    const handlePageHide = () => markLeftPage('pagehide');
    const handleBeforeUnload = () => markLeftPage('beforeunload');

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, markLeftPage]);

  useEffect(() => {
    if (fullscreenGate || activeAlert) return;
    if (queuedAlertRef.current) {
      setActiveAlert(queuedAlertRef.current);
      queuedAlertRef.current = null;
      lastAlertAtRef.current = Date.now();
    }
  }, [activeAlert, fullscreenGate]);

  const requestFullscreen = useCallback(async () => {
    if (!isFullscreenSupported || !document.documentElement?.requestFullscreen) {
      debugLog('fullscreen_not_supported');
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      debugLog('fullscreen_request_failed', { error });
    }
  }, [debugLog, isFullscreenSupported]);

  return {
    stats,
    activeAlert,
    fullscreenGate,
    isFullscreen,
    isFullscreenSupported,
    clearAlert,
    requestFullscreen,
    markLeftPage,
  };
};
