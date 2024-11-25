import React, { useEffect, useState } from 'react';
import {
  Box,
  Card as MuiCard,
  CardContent,
  Chip,
  Container,
  Grid,
  Pagination,
  Typography,
  useTheme,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  collection,
  query,
  limit,
  getDocs,
  where,
  QueryDocumentSnapshot,
  Timestamp,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Card, Season, seasonLabels, seasonColors } from '../types';
import { useAuth } from '../contexts/AuthContext';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';

const CARDS_PER_PAGE = 12;

const CardsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<Set<Season>>(new Set());
  const [selectedAttachment, setSelectedAttachment] = useState<{url: string, type: string, name: string} | null>(null);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [seasonMenuAnchor, setSeasonMenuAnchor] = useState<{
    element: HTMLElement | null;
    cardId: string | null;
  }>({ element: null, cardId: null });

  // Fonction utilitaire pour formater la date en toute sécurité
  const formatDate = (timestamp: any): string => {
    try {
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString();
      } else if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      } else if (timestamp && timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      } else {
        return new Date().toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toLocaleDateString();
    }
  };

  // Fonction pour mettre à jour la saison d'une carte
  const handleSeasonUpdate = async (newSeason: Season) => {
    try {
      if (!seasonMenuAnchor.cardId) return;

      const cardRef = doc(db, 'cards', seasonMenuAnchor.cardId);
      await updateDoc(cardRef, {
        season: newSeason
      });

      // Mettre à jour l'état local
      const updatedCards = cards.map(card => 
        card.id === seasonMenuAnchor.cardId 
          ? { ...card, season: newSeason }
          : card
      );
      setCards(updatedCards);
      
      // Mettre à jour les cartes filtrées
      const updatedFilteredCards = filteredCards.map(card =>
        card.id === seasonMenuAnchor.cardId
          ? { ...card, season: newSeason }
          : card
      );
      setFilteredCards(updatedFilteredCards);

      // Fermer le menu
      setSeasonMenuAnchor({ element: null, cardId: null });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la saison:', error);
      setError('Erreur lors de la mise à jour de la saison');
    }
  };

  const fetchCards = async (lastVisible: QueryDocumentSnapshot | null = null) => {
    try {
      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('Fetching cards for user:', user.uid);
      setLoading(true);
      setError('');

      const cardsRef = collection(db, 'cards');
      const constraints = [
        where('userId', '==', user.uid),
        limit(CARDS_PER_PAGE)
      ];

      const q = query(cardsRef, ...constraints);
      
      try {
        console.log('Executing Firestore query...');
        const querySnapshot = await getDocs(q);
        console.log('Query executed successfully, docs count:', querySnapshot.size);

        if (querySnapshot.empty) {
          console.log('No cards found for user');
          setCards([]);
          setFilteredCards([]);
          setTotalPages(1);
          return;
        }

        const cardsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Processing document:', doc.id, 'createdAt:', data.createdAt);
          
          // Ensure createdAt is a Firestore Timestamp
          let createdAtTimestamp: any;
          try {
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
              createdAtTimestamp = data.createdAt;
            } else if (data.createdAt instanceof Date) {
              createdAtTimestamp = Timestamp.fromDate(data.createdAt);
            } else if (data.createdAt && data.createdAt.seconds) {
              createdAtTimestamp = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds || 0);
            } else {
              createdAtTimestamp = Timestamp.now();
            }
          } catch (error) {
            console.error('Error processing createdAt:', error);
            createdAtTimestamp = Timestamp.now();
          }
          
          return {
            id: doc.id,
            content: data.content || '',
            userName: data.userName || '',
            userNickname: data.userNickname || '',
            userId: data.userId || user.uid,
            createdAt: createdAtTimestamp,
            season: data.season || 'spring',
            imageUrl: data.imageUrl || null,
            attachment: data.imageUrl ? {
              url: data.imageUrl,
              type: 'image',
              name: 'Image attachée'
            } : null
          } as Card;
        });

        console.log('Successfully processed cards data:', cardsData.length);
        setCards(cardsData);
        setFilteredCards(cardsData);
        setTotalPages(Math.max(1, Math.ceil(querySnapshot.size / CARDS_PER_PAGE)));

      } catch (queryError) {
        console.error('Error executing query:', queryError);
        throw queryError;
      }

    } catch (err) {
      console.error('Error in fetchCards:', err);
      if (err instanceof Error) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError('Une erreur inattendue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCards = async () => {
      if (user && isMounted) {
        await fetchCards(null);
      }
    };

    loadCards();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (cards.length > 0) {
      const filtered = selectedCategories.size === 0
        ? cards
        : cards.filter(card => selectedCategories.has(card.season));
      setFilteredCards(filtered);
    }
  }, [selectedCategories, cards]);

  const handleCategoryFilter = (category: Season) => {
    setSelectedCategories(prev => {
      const newCategories = new Set(prev);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return newCategories;
    });
  };

  const clearFilter = () => {
    setSelectedCategories(new Set());
    setFilteredCards(cards);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    fetchCards(null);
  };

  const handleAttachmentClick = (attachment: { url: string, type: string, name: string } | null | undefined) => {
    if (attachment) {
      setSelectedAttachment(attachment);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedCard(index);
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedCard(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedCard === null) return;
    
    const newCards = [...filteredCards];
    const draggedItem = newCards[draggedCard];
    
    // Supprime l'élément de sa position actuelle
    newCards.splice(draggedCard, 1);
    // Insère l'élément à sa nouvelle position
    newCards.splice(dropIndex, 0, draggedItem);
    
    setFilteredCards(newCards);
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      // Met à jour l'ordre dans la liste complète des cartes
      const cardIndexInFullList = prevCards.findIndex(card => card.id === draggedItem.id);
      const dropIndexInFullList = prevCards.findIndex(card => card.id === newCards[dropIndex === 0 ? 0 : dropIndex - 1]?.id) + 1;
      
      updatedCards.splice(cardIndexInFullList, 1);
      updatedCards.splice(dropIndexInFullList, 0, draggedItem);
      
      return updatedCards;
    });
  };

  if (loading && cards.length === 0) {
    return (
      <Container>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography>Chargement...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {Object.entries(seasonLabels).map(([season, label]) => (
            <Chip
              key={season}
              label={label}
              onClick={() => handleCategoryFilter(season as Season)}
              sx={{
                backgroundColor: selectedCategories.has(season as Season)
                  ? seasonColors[season as Season]
                  : 'default',
                color: selectedCategories.has(season as Season)
                  ? theme.palette.getContrastText(seasonColors[season as Season])
                  : 'inherit',
              }}
            />
          ))}
          {selectedCategories.size > 0 && (
            <IconButton onClick={clearFilter} size="small">
              <FilterAltOffIcon />
            </IconButton>
          )}
        </Stack>

        <Grid container spacing={3}>
          {filteredCards.map((card, index) => (
            <Grid item key={card.id} xs={12} sm={6} md={4}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              sx={{
                cursor: 'move',
                '& > *': {
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                },
              }}
            >
              <MuiCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {card.userNickname || card.userName}
                    </Typography>
                    {card.imageUrl && (
                      <IconButton
                        size="small"
                        onClick={() => handleAttachmentClick(card.attachment)}
                      >
                        <AttachFileIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body1" component="div" sx={{ mb: 1.5 }}>
                    {card.content}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={seasonLabels[card.season]}
                      size="small"
                      onClick={(event) => setSeasonMenuAnchor({ 
                        element: event.currentTarget, 
                        cardId: card.id 
                      })}
                      sx={{
                        backgroundColor: seasonColors[card.season],
                        color: theme.palette.getContrastText(seasonColors[card.season]),
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.9,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(card.createdAt)}
                    </Typography>
                  </Box>
                  {card.imageUrl && (
                    <Box 
                      sx={{ 
                        mt: 2,
                        position: 'relative',
                        width: '100%',
                        paddingTop: '56.25%', // 16:9 Aspect Ratio
                        overflow: 'hidden',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleAttachmentClick(card.attachment)}
                    >
                      <Box
                        component="img"
                        src={card.imageUrl}
                        alt="Pièce jointe"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </MuiCard>
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Box>

      <Dialog
        open={!!selectedAttachment}
        onClose={() => setSelectedAttachment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Pièce jointe</Typography>
            <IconButton onClick={() => setSelectedAttachment(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAttachment?.type.startsWith('image') ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={selectedAttachment.url}
                alt={selectedAttachment.name}
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            </Box>
          ) : (
            <Typography>Type de fichier non pris en charge</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAttachment(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Menu pour changer la saison */}
      <Menu
        anchorEl={seasonMenuAnchor.element}
        open={Boolean(seasonMenuAnchor.element)}
        onClose={() => setSeasonMenuAnchor({ element: null, cardId: null })}
      >
        {Object.entries(seasonLabels).map(([season, label]) => (
          <MenuItem
            key={season}
            onClick={() => handleSeasonUpdate(season as Season)}
            sx={{
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: `${seasonColors[season as Season]}22`,
              },
            }}
          >
            <Chip
              label={label}
              size="small"
              sx={{
                backgroundColor: seasonColors[season as Season],
                color: theme.palette.getContrastText(seasonColors[season as Season]),
                cursor: 'pointer',
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Container>
  );
};

export default CardsPage;
