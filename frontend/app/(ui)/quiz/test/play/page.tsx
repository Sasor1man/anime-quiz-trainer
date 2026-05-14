/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { FC, useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { observer } from 'mobx-react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, LinearProgress, Button, TextField,
  Autocomplete, Select, MenuItem,
  Alert, Skeleton, Stack, CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { testStore } from '../test.store';
import { animeStore } from '@/app/(ui)/anime/anime.store';
import { titleStore } from '@/app/(ui)/anime/[title]/title.store';
import VideoPlayer from '@/app/(ui)/{components}/VideoPlayer';
import { useDebounce } from '@/hooks/useDebounce';

const TestPlay: FC = () => {
  // ─────────────────────────────────────────────────────────────
  // 🔹 1. Защита роута + редирект при завершении
  // ─────────────────────────────────────────────────────────────
  const router = useRouter();
  const { currentSong, progressPercent, isRunning, isFinished, settings } = testStore;
  const { animeList, getAnimeList, isLoading: animeLoading } = animeStore;
  const { entryList, getEntryList, setFilter } = titleStore;

  useEffect(() => {
    if (!isRunning && !isFinished) router.replace('/quiz/test');
  }, [isRunning, isFinished, router]);

  useEffect(() => {
    if (isFinished) router.push('/quiz/test/result');
  }, [isFinished, router]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 2. Стейт & Рефы
  // ─────────────────────────────────────────────────────────────
  const playerRef = useRef<any>(null);
  const snippetTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [opNumber, setOpNumber] = useState(1);
  const [guessResult, setGuessResult] = useState<'success' | 'fail' | null>(null);
  
  const [mountKey] = useState(() => crypto.randomUUID());
  const [isPlaying, setIsPlaying] = useState(false);
  const isRevealed = guessResult !== null;

  // 🔹 Поиск аниме: стейт ввода + дебаунс
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const debouncedAnimeQuery = useDebounce(animeSearchQuery, 400);

  // ─────────────────────────────────────────────────────────────
  // 🔹 3. Загрузка данных (архитектурно верный паттерн: setFilter → get)
  // ─────────────────────────────────────────────────────────────
  
  // 🔹 Асинхронный поиск аниме: СЕТЬ ФИЛЬТР → ГЕТ СПИСОК
  useEffect(() => {
    // 1️⃣ Синхронно обновляем фильтр в сторе
    animeStore.setFilter({ 
      filterText: debouncedAnimeQuery, 
      maxResultCount: 20,  // 🔹 Лимит 20 как в создании опов
      skipCount: 0 
    });
    // 2️⃣ Асинхронно загружаем данные (метод сам прочитает this.filter)
    getAnimeList();
  }, [debouncedAnimeQuery, getAnimeList]);

  // Загрузка сезонов при выборе аниме (тот же паттерн)
  useEffect(() => {
    if (selectedAnimeId) {
      setFilter({ animeId: selectedAnimeId, skipCount: 0, maxResultCount: 50 });
      getEntryList();
    } else {
      setSelectedEntryId('');
    }
  }, [selectedAnimeId, setFilter, getEntryList]);

  const filteredEntries = useMemo(
    () => entryList?.filter(e => e.animeId === selectedAnimeId) || [],
    [entryList, selectedAnimeId]
  );

  const selectedAnimeObj = useMemo(
    () => animeList?.find(a => a.id === selectedAnimeId) || null,
    [animeList, selectedAnimeId]
  );

  // ─────────────────────────────────────────────────────────────
  // 🔹 4. Логика сниппета
  // ─────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (snippetTimerRef.current) {
      clearTimeout(snippetTimerRef.current);
      snippetTimerRef.current = null;
    }
  }, []);

  const playSnippet = useCallback(() => {
    clearTimer();
    const p = playerRef.current;
    if (!p || !currentSong) return;

    const startTime = currentSong.startAtSeconds ?? 0;
    p.pause();
    p.currentTime = Math.max(0, startTime);

    p.play().catch(() => { p.muted = true; p.play(); });
    setIsPlaying(true);
    
    const duration = settings?.segmentSeconds ?? 5;
    snippetTimerRef.current = setTimeout(() => {
      setIsPlaying(false);
    }, duration * 1000);
  }, [currentSong, settings?.segmentSeconds, clearTimer]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 5. Обработчики
  // ─────────────────────────────────────────────────────────────
  const handleGuess = useCallback(() => {
    if (!selectedAnimeId || !selectedEntryId || !opNumber) return;
    const isCorrect = testStore.checkAnswer(selectedAnimeId, selectedEntryId, opNumber);
    setGuessResult(isCorrect ? 'success' : 'fail');
    clearTimer();
    setIsPlaying(false);
  }, [selectedAnimeId, selectedEntryId, opNumber, clearTimer]);

  const handleNext = useCallback(() => {
    setGuessResult(null);
    setSelectedAnimeId('');
    setSelectedEntryId('');
    setOpNumber(1);
    setIsPlaying(false);
    animeStore.resetFilter();
    testStore.nextSong();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 🔹 6. useEffect (Синхронизация)
  // ─────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    setIsPlaying(false);
    clearTimer();
  }, [mountKey, currentSong?.song.id, clearTimer]);

  useEffect(() => {
    if (currentSong && !guessResult) {
      const t = setTimeout(() => playSnippet(), 100);
      return () => clearTimeout(t);
    }
  }, [currentSong?.song.id, mountKey, guessResult, playSnippet]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 7. Render
  // ─────────────────────────────────────────────────────────────
  if (!currentSong) return <Box sx={{ p: 4 }}><Skeleton variant="rectangular" height={300} /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Прогресс */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
          <span>Вопрос {progressPercent > 0 ? Math.round((testStore.currentIndex + 1) / (testStore.songs.length) * 100) : 0}%</span>
          <span>{testStore.currentIndex + 1} / {testStore.songs.length}</span>
        </Typography>
        <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 6, borderRadius: 3 }} />
      </Box>

      {/* 🔹 Плеер + Заглушка */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3, position: 'relative' }}>
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
          <VideoPlayer
            key={`${currentSong?.song.id || 'loading'}-${mountKey}`}
            ref={playerRef}
            src={currentSong.song.youtubeUrl || ''}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            playing={isPlaying}
            loop={false}
            controls={isRevealed}
            config={{ youtube: { playerVars: { enablejsapi: 1, playsinline: 1, controls: 0, modestbranding: 1, disablekb: 1 } } as any}}
          />

          {!isRevealed && (
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'grey.900', zIndex: 1, borderRadius: 2
            }}>
              <Typography color="grey.400" align="center" sx={{ px: 2 }}>
                🎧 Слушай сниппет и угадывай аниме
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Контролы сниппета */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
        <Button size="small" startIcon={<PlayArrowIcon />} onClick={playSnippet} disabled={guessResult !== null}>
          Слушать
        </Button>
      </Box>

      {/* Форма угадывания */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* 🔹 Асинхронный Autocomplete с дебаунсом */}
          <Autocomplete
            options={animeList || []}
            loading={animeLoading}
            value={selectedAnimeObj}
            disabled={guessResult !== null}
            onInputChange={(_, newInput, reason) => {
              if (reason !== 'reset') setAnimeSearchQuery(newInput);
            }}
            onChange={(_, newVal) => {
              setSelectedAnimeId(newVal?.id || '');
              setSelectedEntryId('');
              setOpNumber(1);
            }}
            getOptionLabel={(opt) => opt.title}
            isOptionEqualToValue={(option, value) => value ? option.id === value.id : false}
            filterOptions={(options) => options}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Аниме"
                size="small"
                placeholder="Начни вводить название..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {animeLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText={animeSearchQuery ? 'Ничего не найдено' : 'Введите название для поиска'}
            loadingText="Поиск..."
          />

          <Select 
            value={selectedEntryId} 
            displayEmpty 
            size="small" 
            disabled={!selectedAnimeId || guessResult !== null}
            onChange={e => setSelectedEntryId(e.target.value)}
          >
            <MenuItem value="" disabled>Выберите сезон</MenuItem>
            {filteredEntries.map(e => <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>)}
          </Select>

          <TextField
            size="small"
            label="№ OP"
            type="number"
            value={opNumber}
            disabled={guessResult !== null}
            onChange={e => setOpNumber(Number(e.target.value))}
            inputProps={{ min: 1, max: 10 }}
          />
        </Stack>
      </Paper>

      {/* Фидбек */}
      {guessResult && (
        <Alert severity={guessResult === 'success' ? 'success' : 'error'} sx={{ mb: 3 }}>
          {guessResult === 'success' ? (
            <Stack direction="row" alignItems="center" gap={1}><CheckCircleIcon /> Верно!</Stack>
          ) : (
            <Stack direction="row" alignItems="center" gap={1}>
              <ErrorIcon /> Неверно. Правильный ответ: {currentSong.song.animeTitle} ({currentSong.song.animeEntryTitle}) OP {currentSong.song.orderNumber}
            </Stack>
          )}
        </Alert>
      )}

      {/* Кнопки действий */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!guessResult ? (
          <Button variant="contained" size="large" onClick={handleGuess} disabled={!selectedAnimeId || !selectedEntryId}>
            Угадать
          </Button>
        ) : (
          <Button variant="contained" size="large" startIcon={<SkipNextIcon />} onClick={handleNext}>
            Следующий вопрос
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default observer(TestPlay);