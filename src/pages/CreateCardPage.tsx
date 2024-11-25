import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

const CreateCardPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Season>('winter');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (maximum 5MB)');
        return;
      }
      if (!selectedFile.type.startsWith('image/')) {
        setError('Seules les images sont acceptées');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}.${fileExtension}`;
        const filePath = `cards/${user?.uid}/${fileName}`;
        
        console.log('Creating storage reference for:', filePath);
        const storageRef = ref(storage, filePath);
        
        console.log('Starting upload task');
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress:', progress);
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error(`Erreur de téléchargement: ${error.message}`));
          },
          async () => {
            try {
              console.log('Upload completed, getting download URL');
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', url);
              resolve(url);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(new Error('Erreur lors de la récupération de l\'URL'));
            }
          }
        );
      } catch (error) {
        console.error('Error in uploadFile:', error);
        reject(new Error('Erreur lors de l\'initialisation du téléchargement'));
      }
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vous devez être connecté pour créer une carte');
      return;
    }

    if (!content.trim()) {
      setError('Le message ne peut pas être vide');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      let imageUrl = null;

      if (file) {
        try {
          console.log('Starting file upload process');
          imageUrl = await uploadFile(file);
          console.log('File upload completed');
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          throw new Error(uploadError.message || 'Erreur lors du téléchargement du fichier');
        }
      }

      console.log('Creating card document');
      const cardData = {
        content: content.trim(),
        category,
        imageUrl,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'cards'), cardData);
      console.log('Card created successfully:', docRef.id);
      navigate('/cards');
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'Une erreur est survenue lors de la création de la carte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Créer une nouvelle carte
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Saison</InputLabel>
            <Select
              value={category}
              label="Saison"
              onChange={(e) => setCategory(e.target.value as Season)}
              disabled={loading}
            >
              <MenuItem value="winter">Hiver</MenuItem>
              <MenuItem value="spring">Printemps</MenuItem>
              <MenuItem value="summer">Été</MenuItem>
              <MenuItem value="autumn">Automne</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            component="label"
            fullWidth
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {file ? file.name : 'Choisir une image'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileSelect}
            />
          </Button>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Téléchargement : {uploadProgress}%
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <span>En cours...</span>
              </Box>
            ) : (
              'Créer la carte'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCardPage;
