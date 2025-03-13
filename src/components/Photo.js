import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  CardMedia,
  Button,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import { findUserByEmail } from '../utils/userUtils';

function Photo() {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser?.email) {
          setError('Please log in to view photos');
          return;
        }

        // Find the matching user first
        const matchedUser = await findUserByEmail(currentUser.email);
        if (!matchedUser) {
          setError('User not found');
          return;
        }

        // Fetch albums for the matched user
        const albumsResponse = await axios.get(`https://jsonplaceholder.typicode.com/users/${matchedUser.id}/albums`);
        setAlbums(albumsResponse.data);

        // Fetch photos
        const photosResponse = await axios.get('https://jsonplaceholder.typicode.com/photos');
        let filteredPhotos;
        
        if (albumId) {
          // If viewing a specific album, only show photos from that album
          // Also verify that this album belongs to the user
          const albumBelongsToUser = albumsResponse.data.some(album => album.id === parseInt(albumId));
          if (!albumBelongsToUser) {
            setError('Album not found or access denied');
            return;
          }
          filteredPhotos = photosResponse.data.filter(photo => photo.albumId === parseInt(albumId));
        } else {
          // Show photos from all albums belonging to the user
          filteredPhotos = photosResponse.data.filter(photo => 
            albumsResponse.data.some(album => album.id === photo.albumId)
          );
        }
        setPhotos(filteredPhotos);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading photos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [albumId, currentUser]);

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Please log in to view photos.</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading photos...</Typography>
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

  const filteredPhotos = photos.filter(photo =>
    photo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group photos by album
  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    if (!acc[photo.albumId]) {
      acc[photo.albumId] = [];
    }
    acc[photo.albumId].push(photo);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {albumId && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/albums')}
          sx={{ mb: 2 }}
        >
          Back to Albums
        </Button>
      )}

      <Typography variant="h4" gutterBottom>
        {albumId ? 'Album Photos' : 'All Photos'}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search photos..."
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

      {Object.entries(groupedPhotos).map(([currentAlbumId, albumPhotos]) => (
        <Box key={currentAlbumId} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {albums.find(album => album.id === parseInt(currentAlbumId))?.title || 'Album'}
          </Typography>
          <Grid container spacing={3}>
            {albumPhotos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                <Card elevation={3}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.url}
                    alt={photo.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {photo.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {filteredPhotos.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          No photos found matching your search.
        </Typography>
      )}
    </Container>
  );
}

export default Photo;
