'use client';

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Chip,
  Pagination, SpeedDial, SpeedDialAction, SpeedDialIcon,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Autocomplete, CircularProgress,
  Alert, Skeleton, Tooltip, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IArtist } from '../artists/artists.type';
import { AnimeEntryInfo } from '../anime/[title]/title.type';
import { titleStore } from '../anime/[title]/title.store';
import { artistsStore } from '../artists/artists.store';
import { SearchField } from '../{components}/SearchBar';
import { songsStore } from './songs.store';
import { ISong, SongDto, SongType, SongDifficulty } from './songs.type';
import { difficultyConfig, songDifficultyArray, songTypes, songTypesConfig } from './songs.config';
import { authStore } from '@/Auth/auth.store';

const SongsPage: FC = () => {
  // ─────────────────────────────────────────────────────────────
  // 🔹 1. Хуки библиотек / Next.js
  // ─────────────────────────────────────────────────────────────

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
  
  // 🔹 Форма хранит только ID (для API), Autocomplete работает с объектами
  const [songForm, setSongForm] = useState<Partial<SongDto>>({
    songTitle: '', artistId: '', animeEntryId: '', type: SongType.op,
    youtubeUrl: '', orderNumber: 1, difficulty: SongDifficulty.Medium, startTiming: 0, chorusTiming: 0
  });

  // ─────────────────────────────────────────────────────────────
  // 🔹 4. Переменные + useMemo
  // ─────────────────────────────────────────────────────────────
  const pageSize = filter.maxResultCount || 10;
  const currentPage = Math.floor((filter.skipCount || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const visibleSongs = useMemo(() => songList || [], [songList]);

  // 🔹 FIX: Подстановка исполнителя — берём из targetSong.artist (приходит с песней)
  // Если редактируем и есть artist объект — используем его. Иначе ищем в списке.
  const selectedArtistObj = useMemo(() => {
    if (isEditMode && targetSong?.artist) {
      return targetSong.artist;
    }
    return artistList?.find(a => a.id === songForm.artistId) || null;
  }, [isEditMode, targetSong, artistList, songForm.artistId]);
  
  // 🔹 Для сезона: полного объекта в ISong нет, ищем в entryList по ID
  const selectedEntryObj = useMemo(() => {
    // Если редактируем, можно подставить минимальный объект для отображения
    if (isEditMode && targetSong?.animeEntryId && targetSong?.animeEntryTitle) {
      // Создаём минимальный объект для отображения, если нет в списке
      const found = entryList?.find(e => e.id === songForm.animeEntryId);
      if (found) return found;
      // Fallback: минимальный объект для отображения названия
      return { id: targetSong.animeEntryId, title: targetSong.animeEntryTitle } as AnimeEntryInfo;
    }
    return entryList?.find(e => e.id === songForm.animeEntryId) || null;
  }, [isEditMode, targetSong, entryList, songForm.animeEntryId]);

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
      youtubeUrl: '', orderNumber: 1, difficulty: SongDifficulty.Medium, startTiming: 0, chorusTiming: 0
    });
  }, []);

  const handleOpenEdit = useCallback((song: ISong) => {
    setTargetSong(song);
    setIsEditMode(true);
    // 🔹 FIX: Устанавливаем только ID. Autocomplete подставит объект через selectedArtistObj/selectedEntryObj
    setSongForm({
      songTitle: song.songTitle, 
      artistId: song.artistId,
      animeEntryId: song.animeEntryId,
      type: song.type, 
      youtubeUrl: song.youtubeUrl, 
      orderNumber: song.orderNumber,
      difficulty: song.difficulty, 
      startTiming: song.startTiming, 
      chorusTiming: song.chorusTiming
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

  // 🔹 Обработчики для SearchField (основной список)
  const handleSongsSearch = useCallback((value: string) => {
    setFilter({ filterText: value, skipCount: 0 });
  }, [setFilter]);

  // 🔹 Обработчики для Autocomplete: принимаем объект, сохраняем ID
  const handleArtistChange = useCallback((_: any, newValue: IArtist | null) => {
    handleFormChange('artistId', newValue?.id || '');
  }, [handleFormChange]);

  const handleEntryChange = useCallback((_: any, newValue: AnimeEntryInfo | null) => {
    handleFormChange('animeEntryId', newValue?.id || '');
  }, [handleFormChange]);

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
    // 🔹 Списки артистов и сезонов приходят с бэка вместе с песнями — просто ждём их загрузки
    // Если они ещё не загружены — триггерим (на всякий случай)
    if (!artistList?.length) await getArtists();
    if (!entryList?.length) await getEntryList();
  }, [artistList, entryList, getArtists, getEntryList]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 7. useEffect
  // ─────────────────────────────────────────────────────────────
  useEffect(() => { 
    getSongsList(); 
  }, [filter.skipCount, filter.maxResultCount, filter.filterText, getSongsList]);

  // 🔹 Загружаем справочники при открытии модалки (если ещё не загружены)
  useEffect(() => {
    if (isModalOpen && isAdmin) {
      loadDependencies();
    }
  }, [isModalOpen, isAdmin, loadDependencies]);

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
      
      {/* 🔹 Заголовок + Поиск по песням */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Список песен</Typography>
        <SearchField
          onSearch={handleSongsSearch}
          placeholder="Поиск по названию, исполнителю..."
          isLoading={isLoading}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Box>

      {/* 🔹 Сетка карточек */}
      {visibleSongs.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {filter.filterText ? 'Ничего не найдено по запросу' : 'Песни не найдены'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {visibleSongs.map((song) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={song.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <CardMedia
                  component="div"
                  sx={{ height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                    <Chip label={songTypesConfig[song.type]?.label?.toUpperCase()} size="small" color={song.type === SongType.op ? 'primary' : song.type === SongType.ed ? 'secondary' : 'default'} />
                    <Chip label={difficultyConfig[song.difficulty]?.label} size="small" variant="outlined" />
                    {song.orderNumber && <Chip label={`#${song.orderNumber}`} size="small" sx={{ bgcolor: 'grey.100' }} />}
                  </Box>

                  {(song.startTiming > 0 || song.chorusTiming > 0) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {song.startTiming > 0 && `Старт: ${song.startTiming}с`}
                        {song.startTiming > 0 && song.chorusTiming > 0 && ' • '}
                        {song.chorusTiming > 0 && `Припев: ${song.chorusTiming}с`}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                {isAdmin && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5, pt: 0 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(song)} sx={{ mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleOpenDelete(song)}><DeleteIcon fontSize="small" /></IconButton>
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
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" showFirstButton showLastButton />
        </Box>
      )}

      {/* 🔹 SpeedDial */}
      {isAdmin && (
        <SpeedDial ariaLabel="Создать песню" sx={{ position: 'fixed', bottom: 24, right: 24 }} icon={<SpeedDialIcon />}>
          <SpeedDialAction icon={<AddIcon />} tooltipTitle="Добавить песню" onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} />
        </SpeedDial>
      )}

      {/* 🔹 Модалка: Создание / Редактирование */}
      <Dialog open={isModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Редактировать песню' : 'Новая песня'}</DialogTitle>
        <DialogContent>
          
          {/* 🔹 Сезон / Энтри: Autocomplete */}
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              options={entryList || []}
              value={selectedEntryObj}
              onChange={handleEntryChange}
              getOptionLabel={(option) => option.title}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              loading={isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Сезон / Энтри *"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {/* 🔹 Исполнитель: Autocomplete (FIX: подстановка из targetSong.artist) */}
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              options={artistList || []}
              value={selectedArtistObj}
              onChange={handleArtistChange}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              loading={isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Исполнитель *"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <TextField label="Название песни *" value={songForm.songTitle} onChange={e => handleFormChange('songTitle', e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="YouTube URL" value={songForm.youtubeUrl} onChange={e => handleFormChange('youtubeUrl', e.target.value)} fullWidth sx={{ mb: 2 }} />
          
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Тип</InputLabel>
                <Select value={songForm.type ?? SongType.op} label="Тип" onChange={e => handleFormChange('type', Number(e.target.value))}>
                  {songTypes.map((val) => (
                    <MenuItem key={val} value={val}>{songTypesConfig[val]?.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Порядок" type="number" value={songForm.orderNumber} onChange={e => handleFormChange('orderNumber', Number(e.target.value))} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Сложность</InputLabel>
                <Select
                  value={songForm.difficulty ?? SongDifficulty.Medium}
                  label="Сложность"
                  onChange={e => handleFormChange('difficulty', Number(e.target.value) as SongDifficulty)}
                >
                  {songDifficultyArray.map((val) => (
                    <MenuItem key={val} value={val}>{difficultyConfig[val]?.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>Тайминги (в секундах)</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip title="Момент начала трека относительно начала эпизода">
                <TextField label="Старт (с)" type="number" value={songForm.startTiming ?? 0} onChange={e => handleFormChange('startTiming', Number(e.target.value))} fullWidth inputProps={{ min: 0 }} />
              </Tooltip>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip title="Момент начала припева">
                <TextField label="Припев (с)" type="number" value={songForm.chorusTiming ?? 0} onChange={e => handleFormChange('chorusTiming', Number(e.target.value))} fullWidth inputProps={{ min: 0 }} />
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isLoading || !songForm.songTitle || !songForm.artistId || !songForm.animeEntryId}>
            {isLoading ? 'Сохранение...' : isEditMode ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Модалка: Удаление */}
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