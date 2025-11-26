/**
 * monitoringService module.
 *
 * Provides functions for WebSocket connection for exam monitoring.
 */

export const monitoringService = {
  connect: (url: string, onMessage: (data: any) => void): WebSocket => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('Connected to monitoring WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from monitoring WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    return ws;
  }
};