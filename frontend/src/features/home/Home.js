import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';

function Home({ onJoinRoom }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      onJoinRoom(roomId.trim(), username.trim());
    }
  };

  const handleCreateRoom = () => {
    if (username.trim()) {
      const newRoomId = Math.random().toString(36).substring(7);
      onJoinRoom(newRoomId, username.trim());
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <VideoCallIcon sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Baat-Cheet
          </Typography>
        </Box>

        <Typography variant="body1" textAlign="center" color="text.secondary">
          Start or join a secure video chat meeting
        </Typography>

        <Box
          component="form"
          onSubmit={handleJoin}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Your Name"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Room ID"
            variant="outlined"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID to join"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleCreateRoom}
              disabled={!username.trim()}
            >
              Create New Room
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              type="submit"
              disabled={!username.trim() || !roomId.trim()}
            >
              Join Room
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Home;
