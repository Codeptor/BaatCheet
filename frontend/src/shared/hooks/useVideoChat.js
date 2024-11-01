import { useCallback, useState, useRef, useEffect } from 'react';
import { useWebRTC } from './useWebRTC';
import { useWebSocket } from './useWebSocket';

const MAX_RECONNECTION_ATTEMPTS = 3;
const RECONNECTION_DELAY = 2000;

export const useVideoChat = (roomId, username, localStream, onRemoteStream) => {
  const [messages, setMessages] = useState([]);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [remoteUsername, setRemoteUsername] = useState(null);
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  
  const sendMessageRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const {
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    connectionStatus: rtcConnectionStatus,
    cleanup: cleanupRTC
  } = useWebRTC(localStream, onRemoteStream);

  useEffect(() => {
    setConnectionState(rtcConnectionStatus);
  }, [rtcConnectionStatus]);

  const handleReconnection = useCallback(() => {
    if (reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      setReconnectionAttempts(prev => prev + 1);
      reconnectTimeoutRef.current = setTimeout(() => {
        initiateCall((signal) => {
          sendMessageRef.current?.(signal);
        });
      }, RECONNECTION_DELAY);
    } else {
      setConnectionState('failed');
    }
  }, [reconnectionAttempts, initiateCall]);

  const handleWebSocketMessage = useCallback((data) => {
    try {
      switch (data.type) {
        case 'user-connected':
          setRemoteUsername(data.username);
          setConnectionState('connecting');
          initiateCall((signal) => {
            sendMessageRef.current?.(signal);
          });
          break;
        case 'user-disconnected':
          setRemoteUsername(null);
          setConnectionState('disconnected');
          cleanupRTC();
          break;
        case 'offer':
          setConnectionState('connecting');
          handleOffer(data.offer, (signal) => {
            sendMessageRef.current?.(signal);
          });
          break;
        case 'answer':
          handleAnswer(data.answer);
          break;
        case 'ice-candidate':
          handleIceCandidate(data.candidate);
          break;
        case 'chat-message':
          const newMessage = {
            ...data.message,
            id: Date.now() + Math.random(),
            isRead: false
          };
          setMessages(prev => [...prev, newMessage]);
          break;
        case 'error':
          console.error('WebSocket error:', data.error);
          setConnectionState('error');
          handleReconnection();
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      setConnectionState('error');
    }
  }, [initiateCall, handleOffer, handleAnswer, handleIceCandidate, handleReconnection, cleanupRTC]);

  const { 
    sendMessage, 
    isConnected: wsConnected,
    reconnect: wsReconnect
  } = useWebSocket(roomId, handleWebSocketMessage);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const sendChatMessage = useCallback((text) => {
    if (!wsConnected || connectionState !== 'connected') {
      throw new Error('Cannot send message: not connected');
    }

    const message = {
      id: Date.now() + Math.random(),
      text,
      username,
      timestamp: new Date().toISOString(),
      isLocal: true
    };

    setMessages(prev => [...prev, message]);
    
    sendMessageRef.current?.({
      type: 'chat-message',
      message: {
        text,
        username,
        timestamp: message.timestamp
      },
    });
  }, [username, wsConnected, connectionState]);

  const reconnect = useCallback(() => {
    setReconnectionAttempts(0);
    cleanupRTC();
    wsReconnect();
  }, [wsReconnect, cleanupRTC]);

  useEffect(() => {
    return () => {
      cleanupRTC();
      clearTimeout(reconnectTimeoutRef.current);
      setMessages([]);
      setRemoteUsername(null);
      setConnectionState('disconnected');
    };
  }, [cleanupRTC]);

  return {
    messages,
    isConnected: wsConnected && connectionState === 'connected',
    connectionState,
    remoteUsername,
    sendChatMessage,
    reconnect,
  };
};
