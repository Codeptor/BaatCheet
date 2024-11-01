export const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
      ],
    },
  ],
};

export const getWebSocketUrl = (roomId) => {
  const cleanRoomId = roomId.split('/').pop().replace(/[^\w-]/g, '');
  return `ws://localhost:8000/ws/chat/${cleanRoomId}/`;
};

export const MEDIA_CONSTRAINTS = {
  video: true,
  audio: true,
};
