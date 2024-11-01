import React from 'react';
import {
  Paper,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  Message,
} from '@mui/icons-material';

const ControlPanel = ({
  isAudioEnabled,
  isVideoEnabled,
  isChatOpen,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onLeaveRoom,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        mt: 2,
        p: 2,
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Tooltip title={isAudioEnabled ? 'Mute' : 'Unmute'}>
        <IconButton onClick={onToggleAudio}>
          {isAudioEnabled ? <Mic /> : <MicOff color="error" />}
        </IconButton>
      </Tooltip>

      <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
        <IconButton onClick={onToggleVideo}>
          {isVideoEnabled ? <Videocam /> : <VideocamOff color="error" />}
        </IconButton>
      </Tooltip>

      <Button
        variant="contained"
        color="error"
        startIcon={<CallEnd />}
        onClick={onLeaveRoom}
      >
        Leave
      </Button>

      <Tooltip title={isChatOpen ? 'Close chat' : 'Open chat'}>
        <IconButton onClick={onToggleChat}>
          <Message color={isChatOpen ? 'primary' : 'inherit'} />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default ControlPanel;
