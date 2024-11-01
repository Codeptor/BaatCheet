import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Send } from '@mui/icons-material';

function Chat({ messages, onSendMessage }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        Chat
      </Typography>

      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message, index) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary"
                    fontWeight="bold"
                  >
                    {message.username}:
                  </Typography>
                  <Typography component="span" variant="body2">
                    {message.text}
                  </Typography>
                </Box>
              }
              secondary={new Date(message.timestamp).toLocaleTimeString()}
            />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default Chat;
