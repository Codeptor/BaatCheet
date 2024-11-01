import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { Room } from './features/room';
import { Home } from './features/home';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [roomId, setRoomId] = useState(null);
  const [username, setUsername] = useState('');

  const handleJoinRoom = (room, name) => {
    setRoomId(room);
    setUsername(name);
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setUsername('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: 4,
        }}
      >
        <Container>
          {!roomId ? (
            <Home onJoinRoom={handleJoinRoom} />
          ) : (
            <Room
              roomId={roomId}
              username={username}
              onLeaveRoom={handleLeaveRoom}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
