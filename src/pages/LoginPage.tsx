import React, { useState } from 'react';
import { Box, Button, Container, Typography, Alert, Paper } from '@mui/material';
import { Google as GoogleIcon, LinkedIn as LinkedInIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Attempting Google sign in...');
      await signIn();
      console.log('Google sign in successful');
    } catch (error) {
      console.error('Error during Google sign in:', error);
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      setError('La connexion avec LinkedIn sera bientôt disponible');
    } catch (err: any) {
      console.error('Error during LinkedIn sign in:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Cartes Saisonnières
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Connectez-vous pour partager vos cartes
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{
              mb: 2,
              bgcolor: '#DB4437',
              '&:hover': {
                bgcolor: '#C23321',
              },
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter avec Google'}
          </Button>

          <Button
            fullWidth
            variant="contained"
            startIcon={<LinkedInIcon />}
            onClick={handleLinkedInSignIn}
            disabled={loading}
            sx={{
              bgcolor: '#0077B5',
              '&:hover': {
                bgcolor: '#006097',
              },
            }}
          >
            Se connecter avec LinkedIn
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
