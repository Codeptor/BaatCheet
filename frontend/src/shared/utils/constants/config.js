const isDevelopment = process.env.NODE_ENV === 'development';
const WS_PROTOCOL = isDevelopment ? 'ws' : 'wss';
const API_HOST = process.env.REACT_APP_API_HOST || 'localhost:8000';

export const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

export const getWebSocketUrl = (roomId) => {
  const cleanRoomId = roomId.split('/').pop().replace(/[^\w-]/g, '');
  return `${WS_PROTOCOL}://${API_HOST}/ws/chat/${cleanRoomId}/`;
};

export const MEDIA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};
