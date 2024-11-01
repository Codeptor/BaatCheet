import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Paper, Typography, IconButton, Tooltip, Alert, Snackbar } from '@mui/material';
import { ContentCopy, PersonAdd } from '@mui/icons-material';
import { VideoPlayer, ControlPanel } from '../media';
import { Chat } from '../chat';
import { useMediaStream, useVideoChat } from '../../shared/hooks';

function Room({ roomId, username, onLeaveRoom }) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const reconnectTimeoutRef = useRef();

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    error: mediaError,
    reinitializeStream
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
    connectionState,
    remoteUsername,
    reconnect
  } = useVideoChat(roomId, username, localStream, handleRemoteStream);

  useEffect(() => {
    setRemoteUser(remoteUsername);
  }, [remoteUsername]);

  useEffect(() => {
    if (mediaError) {
      setError(mediaError);
    }
  }, [mediaError]);

  useEffect(() => {
    if (connectionState === 'failed' || connectionState === 'disconnected') {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnect();
      }, 5000);
    }

    return () => clearTimeout(reconnectTimeoutRef.current);
  }, [connectionState, reconnect]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, []);

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setShowCopiedNotification(true);
      })
      .catch(() => {
        setError('Failed to copy room ID');
      });
  }, [roomId]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseCopiedNotification = () => {
    setShowCopiedNotification(false);
  };

  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Not Connected';
    }
  };

  const handleRetryConnection = () => {
    reinitializeStream();
    reconnect();
  };

  return (
    <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Room: {roomId} ({getConnectionStatus()})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy Room ID">
              <IconButton onClick={copyRoomId}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title="Invite Link">
              <IconButton onClick={copyRoomId}>
                <PersonAdd />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ flex: 1 }}>
        <Grid item xs={isChatOpen ? 9 : 12}>
          <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            <VideoPlayer
              videoRef={localVideoRef}
              username={`You (${username})`}
              isMuted={true}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
            />

            {remoteStream && (
              <VideoPlayer
                videoRef={remoteVideoRef}
                username={remoteUser || 'Remote User'}
                isMuted={false}
                isAudioEnabled={true}
                isVideoEnabled={true}
              />
            )}
          </Box>
        </Grid>

        {isChatOpen && (
          <Grid item xs={3}>
            <Chat 
              messages={messages} 
              onSendMessage={sendChatMessage}
              disabled={!isConnected}
            />
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
        isConnected={isConnected}
        onRetryConnection={handleRetryConnection}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showCopiedNotification}
        autoHideDuration={2000}
        onClose={handleCloseCopiedNotification}
        message="Room ID copied to clipboard"
      />
    </Box>
  );
}

Room.propTypes = {
  roomId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  onLeaveRoom: PropTypes.func.isRequired,
};

export default Room;
