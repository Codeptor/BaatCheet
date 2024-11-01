import { useCallback, useState, useRef, useEffect } from 'react';
import { useWebRTC } from './useWebRTC';
import { useWebSocket } from './useWebSocket';

export const useVideoChat = (roomId, username, localStream, onRemoteStream) => {
  const [messages, setMessages] = useState([]);
  const sendMessageRef = useRef(null);

  const {
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  } = useWebRTC(localStream, onRemoteStream);

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'user-connected':
        initiateCall((signal) => {
          sendMessageRef.current?.(signal);
        });
        break;
      case 'offer':
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
        setMessages(prev => [...prev, data.message]);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }, [initiateCall, handleOffer, handleAnswer, handleIceCandidate]);

  const { sendMessage, isConnected } = useWebSocket(roomId, handleWebSocketMessage);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const sendChatMessage = useCallback((text) => {
    const message = {
      text,
      username,
      timestamp: new Date().toISOString(),
    };
    sendMessageRef.current?.({
      type: 'chat-message',
      message,
    });
  }, [username]);

  return {
    messages,
    isConnected,
    sendChatMessage,
  };
};
