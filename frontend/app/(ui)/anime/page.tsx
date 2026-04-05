'use client';

import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent,  Typography, Chip, Grid,
  Pagination, IconButton, SpeedDial, SpeedDialAction, SpeedDialIcon,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Skeleton, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HdrAutoIcon from '@mui/icons-material/HdrAuto';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { animeStore } from './anime.store';
import { IAction } from './anime.type';
import CreateAnimeModal from './CreateAnimeModal';
import CreateTagModal from './CreateTagModal';
import { authStore } from '@/Auth/auth.store';

const AnimeList = observer(() => {
  const router = useRouter();
  const { animeList, totalCount, isLoading, filter, getAnimeList, setFilter, deleteAnime } = animeStore;
  const { isAdmin } = authStore;

  const [isCreateAnimeOpen, setIsCreateAnimeOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => { getAnimeList(); }, []);

  // 📊 Пагинация
  const pageSize = filter.maxResultCount || 10;
  const currentPage = Math.floor((filter.skipCount || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilter({ skipCount: (page - 1) * pageSize });
    getAnimeList();
  };

  const handleCardClick = (id: string) => router.push(`/${id}`);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteAnime(deleteTargetId);
      setDeleteTargetId(null);
    } catch (e) {
      console.error('❌ Delete failed:', e);
    }
  };

  const actions: IAction[] = [
    { onClick: () => setIsCreateAnimeOpen(true), name: 'Добавить аниме', icon: <HdrAutoIcon /> },
    { onClick: () => setIsCreateTagOpen(true), name: 'Добавить тег', icon: <NoteAddIcon /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', minHeight: '80vh' }}>
      {/* 🔄 Загрузка */}
      {isLoading && !animeList?.length ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              <Skeleton width="80%" sx={{ mt: 1.5 }} />
              <Skeleton width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : animeList?.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>Аниме не найдены</Alert>
      ) : (
        <>
          {/* 🃏 Сетка карточек */}
          <Grid container spacing={3}>
            {animeList?.map((anime) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={anime.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  }}
                  onClick={() => handleCardClick(anime.id)}
                >
                  

                  {isAdmin && (
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute', top: 8, right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'error.light', color: 'white' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(anime.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}

                  <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
                    <Typography variant="h6" component="div" noWrap title={anime.title}>
                      {anime.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {anime.titleEn}
                    </Typography>

                    {/* 🏷 Теги */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {anime.tags?.map((tag) => (
                        <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 📄 Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* ⚡ SpeedDial */}
      {isAdmin && (
        <SpeedDial
          ariaLabel="Admin Actions"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
      )}

      {/* 📝 Модалки */}
      <CreateAnimeModal open={isCreateAnimeOpen} onClose={() => setIsCreateAnimeOpen(false)} onSuccess={getAnimeList} />
      <CreateTagModal open={isCreateTagOpen} onClose={() => setIsCreateTagOpen(false)} onSuccess={getAnimeList} />

      {/* 🗑 Диалог удаления */}
      <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>Удалить аниме?</DialogTitle>
        <DialogContent>
          <DialogContentText>Это действие нельзя отменить. Аниме будет удалено навсегда.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default AnimeList;