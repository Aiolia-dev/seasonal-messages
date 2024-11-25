import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setNickname(userData.nickname || '');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    // Validation du pseudonyme
    if (nickname && (nickname.length > 12 || !/^[a-zA-Z0-9]+$/.test(nickname))) {
      setError('Le pseudonyme doit contenir maximum 12 caractères alphanumériques');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        nickname,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }, { merge: true });

      setSuccess('Pseudonyme enregistré avec succès');
    } catch (err) {
      console.error('Error updating nickname:', err);
      setError('Une erreur est survenue lors de la mise à jour du pseudonyme');
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestion du compte
      </Typography>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Pseudonyme"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              helperText="Maximum 12 caractères alphanumériques"
              error={!!error}
              sx={{ mb: 3 }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountPage;
