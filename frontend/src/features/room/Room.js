import React, { useRef, useState, useCallback } from 'react';
import { Box, Grid, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { VideoPlayer, ControlPanel } from '../media';
import { Chat } from '../chat';
import { useMediaStream, useVideoChat } from '../../shared/hooks';

function Room({ roomId, username, onLeaveRoom }) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  } = useMediaStream();

  const handleRemoteStream = useCallback((stream) => {
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  const {
    messages,
    isConnected,
    sendChatMessage,
  } = useVideoChat(roomId, username, localStream, handleRemoteStream);

  // Set local stream to video element when available
  React.useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId);
  }, [roomId]);

  return (
    <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Room: {roomId} {isConnected ? '(Connected)' : '(Connecting...)'}
          </Typography>
          <Tooltip title="Copy Room ID">
            <IconButton onClick={copyRoomId}>
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ flex: 1 }}>
        <Grid item xs={isChatOpen ? 9 : 12}>
          <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            <VideoPlayer
              videoRef={localVideoRef}
              username={`You (${username})`}
              isMuted={true}
            />

            {remoteStream && (
              <VideoPlayer
                videoRef={remoteVideoRef}
                username="Remote User"
                isMuted={false}
              />
            )}
          </Box>
        </Grid>

        {isChatOpen && (
          <Grid item xs={3}>
            <Chat messages={messages} onSendMessage={sendChatMessage} />
          </Grid>
        )}
      </Grid>

      <ControlPanel
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isChatOpen={isChatOpen}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onLeaveRoom={onLeaveRoom}
      />
    </Box>
  );
}

export default Room;
