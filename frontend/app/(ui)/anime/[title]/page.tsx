'use client';

import { FC, useEffect, useState, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useParams } from 'next/navigation';
import {
  Box, Typography, Grid, Paper, Chip, Button, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox,
  Card, CardContent, CardActions, List, ListItem, ListItemText, ListItemSecondaryAction, Divider,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

// 🔹 1. Сторы (деструктуризация)
import { animeStore } from '../anime.store';
import { tagStore } from '../CreateTagModal/tag.store';
import { IAnimeDto } from '../anime.type';
import { artistsStore } from '../../artists/artists.store';
import { songsStore } from '../../songs/songs.store';
import { ISong, SongDto, SongType } from '../../songs/songs.type';
import { IArtist } from '../../artists/artists.type';
import { titleStore } from './title.store';
import { AnimeEntryDto, AnimeEntryInfo } from './title.type';
import { authStore } from '@/Auth/auth.store';

// 🔹 2. Типы

const AnimeTitlePage: FC = () => {
  // ─────────────────────────────────────────────────────────────
  // 🔹 1. Хуки библиотек / Next.js
  // ─────────────────────────────────────────────────────────────
  const params = useParams();
  const title = params.title as string;

  // ─────────────────────────────────────────────────────────────
  // 🔹 2. Деструктуризация сторов
  // ─────────────────────────────────────────────────────────────
  const { currentAnime, isLoading: animeLoading, getAnime, updateAnime } = animeStore;
  const { tagList, getTagList } = tagStore;
  const { artistList, getArtists } = artistsStore; // 👈 Добавили artistList
  const { songList, isLoading: songsLoading, getSongsByEntry, createSong, updateSong, deleteSong } = songsStore;
  const { entryList, isLoading: entryLoading, getEntryList, createEntry, updateEntry, deleteEntry, setFilter: setEntryFilter } = titleStore;
  const isAdmin = authStore.isAdmin;

  // ─────────────────────────────────────────────────────────────
  // 🔹 3. React стейты
  // ─────────────────────────────────────────────────────────────
  // Аниме
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Сезоны
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isEditSeasonModalOpen, setIsEditSeasonModalOpen] = useState(false);
  const [seasonForm, setSeasonForm] = useState<Partial<AnimeEntryDto>>({ title: '', titleEn: '', type: 0 });
  const [editingEntry, setEditingEntry] = useState<AnimeEntryInfo | null>(null);

  // Песни
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isEditSongModalOpen, setIsEditSongModalOpen] = useState(false);
  const [isDeleteSongModalOpen, setIsDeleteSongModalOpen] = useState(false);
  const [songForm, setSongForm] = useState<Partial<SongDto>>({
    songTitle: '', artistId: '', animeEntryId: '', type: SongType.op, // 👈 artistId добавлен
    youtubeUrl: '', orderNumber: 1, difficulty: 1, startTiming: 0, chorusTiming: 0
  });
  const [editingSong, setEditingSong] = useState<ISong | null>(null);
  const [targetSong, setTargetSong] = useState<ISong | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 🔹 4. Переменные + useMemo
  // ─────────────────────────────────────────────────────────────
  const visibleEntries = useMemo(() => entryList || [], [entryList]);
  const expandedEntry = useMemo(() => visibleEntries.find(e => e.id === expandedEntryId), [visibleEntries, expandedEntryId]);
  const visibleSongs = useMemo(() => songList || [], [songList]);
  const songTypeOptions = useMemo(() => Object.entries(SongType).filter(([key]) => isNaN(Number(key))), []);

  // ─────────────────────────────────────────────────────────────
  // 🔹 5. Синхронные функции + коллбеки
  // ─────────────────────────────────────────────────────────────
  const handleToggleTag = useCallback((tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  }, []);

  const handleExpandEntry = useCallback((id: string) => {
    setExpandedEntryId(prev => prev === id ? null : id);
  }, []);

  const handleOpenEditSeason = useCallback((entry: AnimeEntryInfo) => {
    if (!title) return;
    setEditingEntry(entry);
    setSeasonForm({ title: entry.title, titleEn: entry.titleEn, type: entry.type, animeId: title });
    setIsEditSeasonModalOpen(true);
  }, [title]);

  const handleCloseSeasonModals = useCallback(() => {
    setIsSeasonModalOpen(false);
    setIsEditSeasonModalOpen(false);
    setEditingEntry(null);
    setSeasonForm({ title: '', titleEn: '', type: 0 });
  }, []);

  const handleOpenAddSong = useCallback(async () => {
    if (!expandedEntryId) return;
    // 👈 Загружаем артистов при открытии модалки
    if (isAdmin) await getArtists();
    setSongForm({
      animeEntryId: expandedEntryId,
      songTitle: '', artistId: '', youtubeUrl: '', type: SongType.op, orderNumber: 1, difficulty: 1, startTiming: 0, chorusTiming: 0
    });
    setIsSongModalOpen(true);
  }, [expandedEntryId, isAdmin]);

  const handleOpenEditSong = useCallback(async (song: ISong) => {
    // 👈 Загружаем артистов при редактировании
    if (isAdmin) await getArtists();
    setEditingSong(song);
    setSongForm({ ...song });
    setIsEditSongModalOpen(true);
  }, [isAdmin]);

  const handleOpenDeleteSong = useCallback((song: ISong) => {
    setTargetSong(song);
    setIsDeleteSongModalOpen(true);
  }, []);

  const handleCloseSongModals = useCallback(() => {
    setIsSongModalOpen(false);
    setIsEditSongModalOpen(false);
    setIsDeleteSongModalOpen(false);
    setEditingSong(null);
    setTargetSong(null);
    setSongForm({ songTitle: '', artistId: '', youtubeUrl: '', type: SongType.op, orderNumber: 1, difficulty: 1, startTiming: 0, chorusTiming: 0 });
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 🔹 6. Асинхронные функции + коллбеки
  // ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!title) return;
    await Promise.all([
      getAnime(title),
      (async () => { setEntryFilter({ animeId: title, skipCount: 0 }); await getEntryList(); })(),
      isAdmin ? getTagList() : Promise.resolve(),
    ]);
  }, [title, isAdmin]);

  const loadSongsForEntry = useCallback(async (entryId: string) => {
    if (!entryId) return;
    await getSongsByEntry({ animeEntryId: entryId, skipCount: 0, maxResultCount: 50, filterText: '' });
  }, []);

  const handleSaveTitle = useCallback(async () => {
    if (!currentAnime?.id) return;
    try {
      const dto: IAnimeDto = { title: editTitle, titleEn: editTitleEn, tagIds: selectedTags };
      await updateAnime(dto, currentAnime.id);
    } catch (e) {
      console.error('❌ Failed to update anime:', e);
    } finally {
      setIsEditing(false);
    }
  }, [currentAnime?.id, editTitle, editTitleEn, selectedTags]);

  const handleSaveSeason = useCallback(async () => {
    if (!seasonForm.title || !title) return;
    try {
      await createEntry({ ...seasonForm, animeId: title } as AnimeEntryDto);
      handleCloseSeasonModals();
    } catch (e) {
      console.error('❌ Failed to create entry:', e);
    }
  }, [seasonForm, title]);

  const handleUpdateSeason = useCallback(async () => {
    if (!editingEntry?.id || !seasonForm.title) return;
    try {
      await updateEntry(seasonForm as Partial<AnimeEntryDto>, editingEntry.id);
      handleCloseSeasonModals();
    } catch (e) {
      console.error('❌ Failed to update entry:', e);
    }
  }, [editingEntry?.id, seasonForm]);

  const handleDeleteSeason = useCallback(async (id: string) => {
    try {
      await deleteEntry(id);
      if (expandedEntryId === id) setExpandedEntryId(null);
    } catch (e) {
      console.error('❌ Failed to delete entry:', e);
    }
  }, [expandedEntryId]);

  const handleSaveTags = useCallback(async () => {
    if (!currentAnime?.id) return;
    try {
      const dto: IAnimeDto = { title: currentAnime.title, titleEn: currentAnime.titleEn, tagIds: selectedTags };
      await updateAnime(dto, currentAnime.id);
      setIsTagModalOpen(false);
    } catch (e) {
      console.error('❌ Failed to update tags:', e);
    }
  }, [currentAnime, selectedTags]);

  const handleSaveSong = useCallback(async () => {
    if (!songForm.songTitle || !songForm.animeEntryId || !songForm.artistId) return;
    try {
      await createSong(songForm as SongDto);
      if (expandedEntryId) await loadSongsForEntry(expandedEntryId);
      handleCloseSongModals();
    } catch (e) {
      console.error('❌ Failed to create song:', e);
    }
  }, [songForm, expandedEntryId]);

  const handleUpdateSong = useCallback(async () => {
    if (!editingSong?.id || !songForm.songTitle || !songForm.artistId) return;
    try {
      await updateSong(songForm as SongDto, editingSong.id);
      if (expandedEntryId) await loadSongsForEntry(expandedEntryId);
      handleCloseSongModals();
    } catch (e) {
      console.error('❌ Failed to update song:', e);
    }
  }, [editingSong, songForm, expandedEntryId]);

  const handleDeleteSong = useCallback(async () => {
    if (!targetSong?.id) return;
    try {
      await deleteSong(targetSong.id);
      if (expandedEntryId) await loadSongsForEntry(expandedEntryId);
      handleCloseSongModals();
    } catch (e) {
      console.error('❌ Failed to delete song:', e);
    }
  }, [targetSong, expandedEntryId]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 7. useEffect
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (currentAnime) {
      setEditTitle(currentAnime.title || '');
      setEditTitleEn(currentAnime.titleEn || '');
      setSelectedTags(currentAnime.tags?.map(t => t.id) || []);
    }
  }, [currentAnime]);

  useEffect(() => {
    if (expandedEntryId) {
      loadSongsForEntry(expandedEntryId);
    }
  }, [expandedEntryId]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 8. Render
  // ─────────────────────────────────────────────────────────────
  if (animeLoading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (!currentAnime) return <Alert severity="warning" sx={{ mt: 4 }}>Аниме не найдено</Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', minHeight: '80vh' }}>
      
      {/* 🔹 Заголовок + редактирование */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 4 }}>
        <Box>
          {isEditing ? (
            <>
              <TextField value={editTitle} onChange={e => setEditTitle(e.target.value)} fullWidth size="small" sx={{ mb: 1, maxWidth: 400 }} />
              <TextField value={editTitleEn} onChange={e => setEditTitleEn(e.target.value)} fullWidth size="small" sx={{ maxWidth: 400 }} />
            </>
          ) : (
            <>
              <Typography variant="h3" sx={{ mb: 0.5 }}>{currentAnime.title}</Typography>
              <Typography variant="h6" color="text.secondary">{currentAnime.titleEn}</Typography>
            </>
          )}
        </Box>
        {isAdmin && (
          <IconButton onClick={isEditing ? handleSaveTitle : () => setIsEditing(true)} color={isEditing ? 'success' : 'default'}>
            {isEditing ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        )}
      </Box>

      {/* 🔹 Сетка: Картинка+Теги / Описание */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ width: '100%', aspectRatio: '3/4', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, mb: 2 }}>
            <Typography color="text.secondary">Постер аниме</Typography>
          </Paper>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {currentAnime.tags?.map(tag => <Chip key={tag.id} label={tag.name} size="small" />)}
            {isAdmin && isEditing && (
              <Chip icon={<EditIcon fontSize="small" />} label="Ред. теги" onClick={() => setIsTagModalOpen(true)} variant="outlined" clickable />
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 3, minHeight: 250, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>Описание</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {'Место для описания...'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 🔹 Сезоны: заголовок + кнопка добавления */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">Сезоны</Typography>
        {isAdmin && <IconButton onClick={() => setIsSeasonModalOpen(true)}><AddIcon /></IconButton>}
      </Box>

      {/* 🔹 Сезоны: список (горизонтальный скролл) */}
      {entryLoading ? (
        <CircularProgress size={30} sx={{ mt: 2 }} />
      ) : (
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, scrollbarWidth: 'thin' }}>
          {visibleEntries.map(entry => {
            const isExpanded = expandedEntryId === entry.id;
            return (
              <Card key={entry.id} sx={{ minWidth: 200, maxWidth: 220, flexShrink: 0, border: isExpanded ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" noWrap>{entry.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{entry.titleEn}</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>Тип: {entry.type}</Typography>
                </CardContent>
                <CardActions disableSpacing sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Box sx={{ display: 'flex' }}>
                    {isAdmin && (
                      <>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditSeason(entry)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteSeason(entry.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </>
                    )}
                  </Box>
                  <IconButton size="small" onClick={() => handleExpandEntry(entry.id)}>
                    <ExpandMoreIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </IconButton>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {/* 🔹 Детали развёрнутого сезона + Песни */}
      {expandedEntry && (
        <Paper elevation={4} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Информация о сезоне</Typography>
            {isAdmin && (
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddSong}>
                Добавить песню
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
            <Typography><b>Название:</b> {expandedEntry.title}</Typography>
            <Typography><b>Создан:</b> {new Date(expandedEntry.createdAt).toLocaleDateString()}</Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* 🎵 Список песен */}
          <Typography variant="subtitle1" gutterBottom>Опенинги / Эндинги / OST:</Typography>
          
          {songsLoading ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Box>
          ) : visibleSongs.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>Песен пока нет</Alert>
          ) : (
            <List dense sx={{ mb: 2 }}>
              {visibleSongs.map(song => (
                <ListItem key={song.id} divider sx={{ alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <Chip 
                      label={SongType[song.type]?.toUpperCase()} 
                      size="small" 
                      color={song.type === SongType.op ? 'primary' : song.type === SongType.ed ? 'secondary' : 'default'}
                      sx={{ height: 20 }}
                    />
                    <Typography variant="body2" color="text.disabled">#{song.orderNumber}</Typography>
                  </Box>
                  
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" component="span">{song.songTitle}</Typography>
                        {song.youtubeUrl && (
                          <IconButton size="small" component="a" href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">
                            <PlayCircleIcon fontSize="small" color="action" />
                          </IconButton>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Исполнитель: {song.artist?.name || 'Не указан'} • Сложность: {song.difficulty}/10
                      </Typography>
                    }
                  />
                  
                  {isAdmin && (
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => handleOpenEditSong(song)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleOpenDeleteSong(song)}><DeleteIcon fontSize="small" /></IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* 🔹 Модалка: Редактирование тегов */}
      <Dialog open={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Управление тегами</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 300, overflowY: 'auto' }}>
            {tagList?.map(tag => (
              <FormControlLabel
                key={tag.id}
                control={<Checkbox checked={selectedTags.includes(tag.id)} onChange={() => handleToggleTag(tag.id)} />}
                label={tag.name}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTagModalOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveTags}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Модалка: Добавление/Редактирование сезона */}
      <Dialog open={isSeasonModalOpen || isEditSeasonModalOpen} onClose={handleCloseSeasonModals} maxWidth="xs" fullWidth>
        <DialogTitle>{isEditSeasonModalOpen ? 'Редактировать сезон' : 'Добавить сезон'}</DialogTitle>
        <DialogContent>
          <TextField label="Название" value={seasonForm.title} onChange={e => setSeasonForm({ ...seasonForm, title: e.target.value })} fullWidth sx={{ mt: 1, mb: 2 }} />
          <TextField label="Название (EN)" value={seasonForm.titleEn} onChange={e => setSeasonForm({ ...seasonForm, titleEn: e.target.value })} fullWidth sx={{ mb: 2 }} />
          <TextField label="Тип (число)" type="number" value={seasonForm.type} onChange={e => setSeasonForm({ ...seasonForm, type: Number(e.target.value) })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSeasonModals}>Отмена</Button>
          <Button variant="contained" onClick={isEditSeasonModalOpen ? handleUpdateSeason : handleSaveSeason}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Модалка: Добавление песни (с выбором артиста) */}
      <Dialog open={isSongModalOpen} onClose={handleCloseSongModals} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить песню</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Исполнитель *</InputLabel>
            <Select
              value={songForm.artistId || ''}
              label="Исполнитель *"
              onChange={e => setSongForm({ ...songForm, artistId: e.target.value })}
              required
            >
              {artistList?.map((artist: IArtist) => (
                <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Название песни *" value={songForm.songTitle} onChange={e => setSongForm({ ...songForm, songTitle: e.target.value })} fullWidth sx={{ mb: 2 }} required />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Тип *</InputLabel>
            <Select
              value={songForm.type ?? SongType.op}
              label="Тип *"
              onChange={e => setSongForm({ ...songForm, type: Number(e.target.value) as SongType })}
            >
              {songTypeOptions.map(([key, val]) => (
                <MenuItem key={val} value={val}>{key.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="URL YouTube" value={songForm.youtubeUrl} onChange={e => setSongForm({ ...songForm, youtubeUrl: e.target.value })} fullWidth sx={{ mb: 2 }} placeholder="https://youtube.com/watch?v=..." />
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}><TextField label="Порядок" type="number" value={songForm.orderNumber} onChange={e => setSongForm({ ...songForm, orderNumber: Number(e.target.value) })} fullWidth /></Grid>
            <Grid size={{ xs: 6 }}><TextField label="Сложность (1-10)" type="number" value={songForm.difficulty} onChange={e => setSongForm({ ...songForm, difficulty: Number(e.target.value) })} fullWidth inputProps={{ min: 1, max: 10 }} /></Grid>
            <Grid size={{ xs: 6 }}><TextField label="Старт (мс)" type="number" value={songForm.startTiming} onChange={e => setSongForm({ ...songForm, startTiming: Number(e.target.value) })} fullWidth /></Grid>
            <Grid size={{ xs: 6 }}><TextField label="Припев (мс)" type="number" value={songForm.chorusTiming} onChange={e => setSongForm({ ...songForm, chorusTiming: Number(e.target.value) })} fullWidth /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSongModals}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveSong} disabled={!songForm.songTitle || !songForm.artistId}>Создать</Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Модалка: Редактирование песни (с выбором артиста) */}
      <Dialog open={isEditSongModalOpen} onClose={handleCloseSongModals} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать песню</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Исполнитель *</InputLabel>
            <Select
              value={songForm.artistId || ''}
              label="Исполнитель *"
              onChange={e => setSongForm({ ...songForm, artistId: e.target.value })}
              required
            >
              {artistList?.map((artist: IArtist) => (
                <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Название песни *" value={songForm.songTitle} onChange={e => setSongForm({ ...songForm, songTitle: e.target.value })} fullWidth sx={{ mb: 2 }} required />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Тип *</InputLabel>
            <Select
              value={songForm.type ?? SongType.op}
              label="Тип *"
              onChange={e => setSongForm({ ...songForm, type: Number(e.target.value) as SongType })}
            >
              {songTypeOptions.map(([key, val]) => (
                <MenuItem key={val} value={val}>{key.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="URL YouTube" value={songForm.youtubeUrl} onChange={e => setSongForm({ ...songForm, youtubeUrl: e.target.value })} fullWidth sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}><TextField label="Порядок" type="number" value={songForm.orderNumber} onChange={e => setSongForm({ ...songForm, orderNumber: Number(e.target.value) })} fullWidth /></Grid>
            <Grid size={{ xs: 6 }}><TextField label="Сложность (1-10)" type="number" value={songForm.difficulty} onChange={e => setSongForm({ ...songForm, difficulty: Number(e.target.value) })} fullWidth inputProps={{ min: 1, max: 10 }} /></Grid>
            <Grid size={{ xs: 6 }}><TextField label="Старт (мс)" type="number" value={songForm.startTiming} onChange={e => setSongForm({ ...songForm, startTiming: Number(e.target.value) })} fullWidth /></Grid>
            <Grid size={{ xs: 6 }}><TextField label="Припев (мс)" type="number" value={songForm.chorusTiming} onChange={e => setSongForm({ ...songForm, chorusTiming: Number(e.target.value) })} fullWidth /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSongModals}>Отмена</Button>
          <Button variant="contained" onClick={handleUpdateSong} disabled={!songForm.songTitle || !songForm.artistId}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Модалка: Удаление песни */}
      <Dialog open={isDeleteSongModalOpen} onClose={handleCloseSongModals}>
        <DialogTitle>Удалить песню?</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить <b>{targetSong?.songTitle}</b>? Это действие нельзя отменить.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSongModals}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleDeleteSong} disabled={songsLoading}>Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default observer(AnimeTitlePage);