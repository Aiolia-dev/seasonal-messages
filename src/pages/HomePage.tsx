import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Create as CreateIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const features = [
    {
      title: 'Créer un Message',
      description: 'Partagez vos pensées saisonnières en quelques clics',
      icon: <CreateIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/create'),
      buttonText: 'Nouveau Message',
    },
    {
      title: 'Explorer les Messages',
      description: 'Découvrez les messages partagés par la communauté',
      icon: <MessageIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/messages'),
      buttonText: 'Voir les Messages',
    },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom>
          Bienvenue, {user?.displayName}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Partagez vos pensées au fil des saisons
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Box
                  sx={{
                    mb: 3,
                    color: theme.palette.primary.main,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={feature.action}
                  sx={{ mt: 'auto' }}
                >
                  {feature.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage;
