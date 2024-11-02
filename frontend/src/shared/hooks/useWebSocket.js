import { useEffect, useRef, useCallback, useState } from 'react';
import { getWebSocketUrl } from '../utils';

const RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;

export const useWebSocket = (roomId, onMessage) => {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const messageQueueRef = useRef([]);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
      MAX_RECONNECT_DELAY
    );
    return delay + Math.random() * 1000;
  }, []);

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
    }
  }, []);

  const processMessageQueue = useCallback(() => {
    while (messageQueueRef.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
      const message = messageQueueRef.current.shift();
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const url = getWebSocketUrl(roomId);
      setConnectionState('connecting');
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        clearTimers();

        heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        processMessageQueue();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'heartbeat-ack') {
            return;
          }
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          onMessage({ type: 'error', error: 'Invalid message format' });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
        onMessage({ type: 'error', error: 'WebSocket connection error' });
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        clearTimers();

        if (event.code !== 1000 && reconnectAttemptsRef.current < RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          const delay = getReconnectDelay();
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else if (reconnectAttemptsRef.current >= RECONNECT_ATTEMPTS) {
          setConnectionState('failed');
          onMessage({ type: 'error', error: 'Maximum reconnection attempts reached' });
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionState('error');
      onMessage({ type: 'error', error: 'Failed to create WebSocket connection' });
    }
  }, [roomId, onMessage, clearTimers, getReconnectDelay, sendHeartbeat, processMessageQueue]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        messageQueueRef.current.push(data);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected. Queueing message:', data);
      messageQueueRef.current.push(data);
      return false;
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect, clearTimers]);

  useEffect(() => {
    connect();

    return () => {
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
      messageQueueRef.current = [];
      reconnectAttemptsRef.current = 0;
    };
  }, [connect, clearTimers]);

  return {
    sendMessage,
    isConnected,
    connectionState,
    reconnect,
  };
};
