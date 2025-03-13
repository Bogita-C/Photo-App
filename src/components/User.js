import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import { findUserByEmail } from '../utils/userUtils';

function User() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser && currentUser.email) {
          const matchedUser = await findUserByEmail(currentUser.email);
          if (matchedUser) {
            setUserData(matchedUser);
          } else {
            setError('User data not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Please log in to view user information.</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading user data...</Typography>
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

  if (!userData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>No user data available.</Typography>
      </Container>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Box sx={{ ml: 2 }}>
        <Typography color="textSecondary" variant="subtitle2">
          {label}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4">{userData.name}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<EmailIcon color="primary" />}
              label="Email"
              value={userData.email}
            />
            <InfoItem
              icon={<PhoneIcon color="primary" />}
              label="Phone"
              value={userData.phone}
            />
            <InfoItem
              icon={<LanguageIcon color="primary" />}
              label="Website"
              value={userData.website}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoItem
              icon={<BusinessIcon color="primary" />}
              label="Company"
              value={userData.company.name}
            />
            <InfoItem
              icon={<LocationOnIcon color="primary" />}
              label="Address"
              value={`${userData.address.street}, ${userData.address.suite}, ${userData.address.city}, ${userData.address.zipcode}`}
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default User;
