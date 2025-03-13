import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import {
  Container,
  Typography,
  Paper,
  TextField,
  IconButton,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import PhotoAlbumIcon from '@mui/icons-material/PhotoAlbum';
import { useAuth } from '../contexts/AuthContext';
import { findUserByEmail } from '../utils/userUtils';

function Album() {
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        if (currentUser && currentUser.email) {
          // First find the matching user
          const matchedUser = await findUserByEmail(currentUser.email);
          if (matchedUser) {
            // Then fetch their albums
            const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${matchedUser.id}/albums`);
            setAlbums(response.data);
          } else {
            setError('User not found');
          }
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
        setError('Error loading albums');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Please log in to view your albums.</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading albums...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Albums
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 1 }}
          />
          {searchTerm && (
            <IconButton onClick={handleClearSearch} color="primary">
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {filteredAlbums.map((album) => (
          <Grid item xs={12} sm={6} md={4} key={album.id}>
            <Card 
              elevation={3}
              onClick={() => navigate(`/albums/${album.id}/photos`)}
              sx={{ height: '100%' }}
            >
              <CardActionArea sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhotoAlbumIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div">
                      {album.title}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAlbums.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          No albums found matching your search.
        </Typography>
      )}
    </Container>
  );
}

export default Album;
