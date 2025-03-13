import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum';
import PhotoIcon from '@mui/icons-material/Photo';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
      title: 'User Profile',
      description: 'View and manage your profile information',
      path: '/user'
    },
    {
      icon: <PhotoAlbumIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
      title: 'Albums',
      description: 'Browse and search through your albums',
      path: '/albums'
    },
    {
      icon: <PhotoIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />,
      title: 'Photos',
      description: 'View and manage your photo collection',
      path: '/photos'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
              onClick={() => navigate(feature.path)}
            >
              {feature.icon}
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;
