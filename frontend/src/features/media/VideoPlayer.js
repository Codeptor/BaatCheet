import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const VideoPlayer = ({ videoRef, username, isMuted = false }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Typography
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            padding: '4px 8px',
            borderRadius: 1,
          }}
        >
          {username}
        </Typography>
      </Box>
    </Paper>
  );
};

export default VideoPlayer;
