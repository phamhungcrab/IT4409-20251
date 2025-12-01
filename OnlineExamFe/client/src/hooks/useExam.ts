import { useEffect, useRef, useState, useCallback } from 'react';
import { monitoringService } from '../services/monitoringService';

interface UseExamProps {
  wsUrl: string;
  studentId: number;
  examId: number;
  onSynced?: () => void;
  onSubmitted?: (result: any) => void;
  onError?: (error: string) => void;
}

export const useExam = ({ wsUrl, studentId, examId, onSynced, onSubmitted, onError }: UseExamProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Use refs for callbacks to avoid reconnecting when they change
  const onSyncedRef = useRef(onSynced);
  const onSubmittedRef = useRef(onSubmitted);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSyncedRef.current = onSynced;
    onSubmittedRef.current = onSubmitted;
    onErrorRef.current = onError;
  }, [onSynced, onSubmitted, onError]);

  const connect = useCallback(() => {
    if (!wsUrl) return;

    setConnectionState(prev => prev === 'disconnected' ? 'connecting' : 'reconnecting');

    const token = localStorage.getItem('token');
    const urlWithToken = token
        ? `${wsUrl}${wsUrl.includes('?') ? '&' : '?'}session=${encodeURIComponent(token)}`
        : wsUrl;

    const ws = monitoringService.connect(urlWithToken, (data) => {
      console.log('WS Message:', data);
      if (data.status === 'submitted') {
        onSubmittedRef.current?.(data);
      } else if (data.type === 'synced') {
        onSyncedRef.current?.();
      } else if (data.type === 'error') {
        onErrorRef.current?.(data.message);
      }
    });

    ws.onopen = () => {
      console.log('WS Connected');
      setConnectionState('connected');
      reconnectAttempts.current = 0;
    };

    ws.onclose = () => {
      console.log('WS Closed');
      setConnectionState('disconnected');
      wsRef.current = null;

      // Auto-reconnect logic
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        console.log(`Reconnecting in ${timeout}ms...`);
        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, timeout);
      } else {
        onErrorRef.current?.('Connection lost. Please refresh the page.');
      }
    };

    wsRef.current = ws;
  }, [wsUrl]); // Only reconnect if wsUrl changes

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const syncAnswer = useCallback((questionId: number, answer: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        Action: 'SubmitAnswer',
        studentId,
        examId,
        questionId,
        answer
      }));
      // Save to local storage as backup
      localStorage.setItem(`exam_${examId}_q_${questionId}`, JSON.stringify(answer));
    } else {
      console.warn('WS not connected, saving to local storage only');
      localStorage.setItem(`exam_${examId}_q_${questionId}`, JSON.stringify(answer));
    }
  }, [studentId, examId]);

  const submitExam = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        Action: 'SubmitExam',
        studentId,
        examId
      }));
    } else {
       onErrorRef.current?.('Cannot submit: Connection lost. Please try again when connected.');
    }
  }, [studentId, examId]);

  return {
    connectionState,
    syncAnswer,
    submitExam
  };
};