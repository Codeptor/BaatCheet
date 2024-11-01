import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

const VideoPlayer = ({ videoRef, username, isMuted = false, isAudioEnabled = true, isVideoEnabled = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
    };
  }, [videoRef]);

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'black',
      }}
    >
      <Box sx={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        {hasError && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <Typography>Failed to load video stream</Typography>
          </Box>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: hasError ? 0 : 1,
          }}
          aria-label={`Video stream of ${username}`}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {username}
            {!isAudioEnabled && <MicOffIcon fontSize="small" />}
            {!isVideoEnabled && <VideocamOffIcon fontSize="small" />}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default VideoPlayer;
