import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Photo Gallery
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Personal Photo Collection
        </Typography>
        <Box sx={{ mt: 4 }}>
          {!currentUser ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/home')}
              sx={{ mr: 2 }}
            >
              Go to Gallery
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default LandingPage;
