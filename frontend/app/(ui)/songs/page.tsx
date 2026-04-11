'use client';

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Chip,
  Pagination, SpeedDial, SpeedDialAction, SpeedDialIcon,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton,
  Alert, Skeleton, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IArtist } from '../artists/artists.type';
import { AnimeEntryInfo } from '../anime/[title]/title.type';
import { titleStore } from '../anime/[title]/title.store';
import { artistsStore } from '../artists/artists.store';
import { songsStore } from './songs.store';
import { ISong, SongDto, SongType } from './songs.type';
import { authStore } from '@/Auth/auth.store';

const SongsPage: FC = () => {
  // ─────────────────────────────────────────────────────────────
  // 🔹 1. Хуки библиотек / Next.js
  // ─────────────────────────────────────────────────────────────
  // (useParams/useRouter при необходимости)

  // ─────────────────────────────────────────────────────────────
  // 🔹 2. Деструктуризация сторов
  // ─────────────────────────────────────────────────────────────
  const { songList, totalCount, isLoading, filter, getSongsList, createSong, updateSong, deleteSong, setFilter } = songsStore;
  const { entryList, getEntryList } = titleStore;
  const { artistList, getArtists } = artistsStore;
  const isAdmin = authStore.isAdmin;

  // ─────────────────────────────────────────────────────────────
  // 🔹 3. React стейты
  // ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetSong, setTargetSong] = useState<ISong | null>(null);
  const [songForm, setSongForm] = useState<Partial<SongDto>>({
    songTitle: '', artistId: '', animeEntryId: '', type: SongType.op,
    youtubeUrl: '', orderNumber: 1, difficulty: 1, startTiming: 0, chorusTiming: 0
  });

  // ─────────────────────────────────────────────────────────────
  // 🔹 4. Переменные + useMemo
  // ─────────────────────────────────────────────────────────────
  const pageSize = filter.maxResultCount || 10;
  const currentPage = Math.floor((filter.skipCount || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const visibleSongs = useMemo(() => songList || [], [songList]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 5. Синхронные функции + коллбеки
  // ─────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setIsDeleteOpen(false);
    setTargetSong(null);
    setIsEditMode(false);
    setSongForm({
      songTitle: '', artistId: '', animeEntryId: '', type: SongType.op,
      youtubeUrl: '', orderNumber: 1, difficulty: 1, startTiming: 0, chorusTiming: 0
    });
  }, []);

  const handleOpenEdit = useCallback((song: ISong) => {
    setTargetSong(song);
    setIsEditMode(true);
    setSongForm({
      songTitle: song.songTitle, artistId: song.artistId, animeEntryId: song.animeEntryId,
      type: song.type, youtubeUrl: song.youtubeUrl, orderNumber: song.orderNumber,
      difficulty: song.difficulty, startTiming: song.startTiming, chorusTiming: song.chorusTiming
    });
    setIsModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((song: ISong) => {
    setTargetSong(song);
    setIsDeleteOpen(true);
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    setFilter({ skipCount: (page - 1) * pageSize });
  }, [pageSize]);

  const handleFormChange = useCallback((field: keyof Partial<SongDto>, value: any) => {
    setSongForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 🔹 6. Асинхронные функции + коллбеки
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!songForm.songTitle || !songForm.animeEntryId || !songForm.artistId) return;
    try {
      if (isEditMode && targetSong?.id) {
        await updateSong(songForm as SongDto, targetSong.id);
      } else {
        await createSong(songForm as SongDto);
      }
      handleClose();
    } catch (e) {
      console.error('❌ Song operation failed:', e);
    }
  }, [isEditMode, targetSong, songForm]);

  const handleDelete = useCallback(async () => {
    if (!targetSong?.id) return;
    try {
      await deleteSong(targetSong.id);
      handleClose();
    } catch (e) {
      console.error('❌ Delete failed:', e);
    }
  }, [targetSong]);

  const loadDependencies = useCallback(async () => {
    await Promise.all([getEntryList(), getArtists()]);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 🔹 7. useEffect
  // ─────────────────────────────────────────────────────────────
  useEffect(() => { getSongsList(); }, []);
  useEffect(() => { getSongsList(); }, [filter.skipCount, filter.maxResultCount, filter.filterText]);

  useEffect(() => {
    if (isModalOpen && isAdmin) loadDependencies();
  }, [isModalOpen, isAdmin]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 8. Render
  // ─────────────────────────────────────────────────────────────
  if (isLoading && !visibleSongs.length) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
              <Skeleton width="80%" sx={{ mt: 1 }} />
              <Skeleton width="60%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', minHeight: '80vh' }}>
      
      {/* 🔹 Заголовок */}
      <Typography variant="h4" sx={{ mb: 4 }}>Список песен</Typography>

      {/* 🔹 Сетка карточек */}
      {visibleSongs.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>Песни не найдены</Alert>
      ) : (
        <Grid container spacing={3}>
          {visibleSongs.map((song) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={song.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Место для фото */}
                <CardMedia
                  component="div"
                  sx={{
                    height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">Постер / Обложка</Typography>
                </CardMedia>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap title={song.songTitle}>{song.songTitle}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    🎤 {song.artist?.name || 'Неизвестно'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    📺 {song.animeEntryTitle}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    <Chip 
                      label={SongType[song.type].toUpperCase()} 
                      size="small" 
                      color={song.type === SongType.op ? 'primary' : song.type === SongType.ed ? 'secondary' : 'default'} 
                    />
                    <Chip label={`Сложность: ${song.difficulty}`} size="small" variant="outlined" />
                    {song.orderNumber && <Chip label={`#${song.orderNumber}`} size="small" sx={{ bgcolor: 'grey.100' }} />}
                  </Box>

                  {/* 🔹 Тайминги (в карточке для быстрого просмотра) */}
                  {(song.startTiming > 0 || song.chorusTiming > 0) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {song.startTiming > 0 && `Старт: ${song.startTiming}мс`}
                        {song.startTiming > 0 && song.chorusTiming > 0 && ' • '}
                        {song.chorusTiming > 0 && `Припев: ${song.chorusTiming}мс`}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                {/* Кнопки действий (только админ) */}
                {isAdmin && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, pt: 0 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(song)} sx={{ mr: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleOpenDelete(song)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 🔹 Пагинация */}
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

      {/* 🔹 SpeedDial создания (только админ) */}
      {isAdmin && (
        <SpeedDial
          ariaLabel="Создать песню"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="Добавить песню"
            onClick={() => { setIsEditMode(false); setIsModalOpen(true); }}
          />
        </SpeedDial>
      )}

      {/* 🔹 Модалка: Создание / Редактирование */}
      <Dialog open={isModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Редактировать песню' : 'Новая песня'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Сезон / Энтри *</InputLabel>
            <Select
              value={songForm.animeEntryId || ''}
              label="Сезон / Энтри *"
              onChange={(e) => handleFormChange('animeEntryId', e.target.value)}
            >
              {entryList?.map((entry: AnimeEntryInfo) => (
                <MenuItem key={entry.id} value={entry.id}>{entry.title}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Исполнитель *</InputLabel>
            <Select
              value={songForm.artistId || ''}
              label="Исполнитель *"
              onChange={(e) => handleFormChange('artistId', e.target.value)}
            >
              {artistList?.map((artist: IArtist) => (
                <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Название песни *" value={songForm.songTitle} onChange={e => handleFormChange('songTitle', e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="YouTube URL" value={songForm.youtubeUrl} onChange={e => handleFormChange('youtubeUrl', e.target.value)} fullWidth sx={{ mb: 2 }} />
          
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Тип</InputLabel>
                <Select value={songForm.type ?? SongType.op} label="Тип" onChange={e => handleFormChange('type', Number(e.target.value))}>
                  {Object.entries(SongType).filter(v => isNaN(Number(v[0]))).map(([key, val]) => (
                    <MenuItem key={key} value={val}>{key.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Порядок" type="number" value={songForm.orderNumber} onChange={e => handleFormChange('orderNumber', Number(e.target.value))} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Сложность" type="number" value={songForm.difficulty} onChange={e => handleFormChange('difficulty', Number(e.target.value))} fullWidth inputProps={{ min: 1, max: 10 }} />
            </Grid>
          </Grid>

          {/* 🔹 Тайминги (новые поля) */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>Тайминги (в миллисекундах)</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip title="Момент начала трека относительно начала эпизода">
                <TextField 
                  label="Старт (мс)" 
                  type="number" 
                  value={songForm.startTiming ?? 0} 
                  onChange={e => handleFormChange('startTiming', Number(e.target.value))} 
                  fullWidth 
                  inputProps={{ min: 0 }}
                />
              </Tooltip>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip title="Момент начала припева">
                <TextField 
                  label="Припев (мс)" 
                  type="number" 
                  value={songForm.chorusTiming ?? 0} 
                  onChange={e => handleFormChange('chorusTiming', Number(e.target.value))} 
                  fullWidth 
                  inputProps={{ min: 0 }}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isLoading || !songForm.songTitle}>
            {isLoading ? 'Сохранение...' : isEditMode ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Модалка: Подтверждение удаления */}
      <Dialog open={isDeleteOpen} onClose={handleClose}>
        <DialogTitle>Удалить песню?</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить <b>{targetSong?.songTitle}</b>? Действие необратимо.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={isLoading}>Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default observer(SongsPage);