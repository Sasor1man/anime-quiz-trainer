'use client';

import { FC, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { observer } from 'mobx-react';
import dynamic from 'next/dynamic';
import {
  Box, Button, Typography, Paper, Slider, Chip,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Alert, Skeleton,
  Autocomplete
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { animeStore } from '../../anime/anime.store';
import { titleStore } from '../../anime/[title]/title.store';
import { learnStore } from './learn.store';
import { LearnReviewQuality } from './learn.type';


// 🔒 SSR-безопасный импорт плеера
const VideoPlayer = dynamic(() => import('@/app/(ui)/{components}/VideoPlayer'), { 
  ssr: false,
  loading: () => <Skeleton variant="rectangular" height={200} /> 
});

const Learn: FC = () => {
  // ─────────────────────────────────────────────────────────────
  // 🔹 1. Хуки библиотек / Next.js
  // ─────────────────────────────────────────────────────────────
  const playerRef = useRef<any>(null);
  const snippetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 🔹 2. Деструктуризация сторов
  // ─────────────────────────────────────────────────────────────
  const { currentSong, isLoading, isSubmitting, getLearnNextSong, submitReview } = learnStore;
  const { animeList, getAnimeList } = animeStore;
  const { entryList, getEntryList, setFilter } = titleStore;

  // ─────────────────────────────────────────────────────────────
  // 🔹 3. React стейты
  // ─────────────────────────────────────────────────────────────
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [opNumber, setOpNumber] = useState(1);
  const [snippetDuration, setSnippetDuration] = useState(5000); // мс
  const [isInfoRevealed, setIsInfoRevealed] = useState(false);
  const [guessResult, setGuessResult] = useState<'success' | 'fail' | null>(null);
  const [feedbackQuality, setFeedbackQuality] = useState<LearnReviewQuality | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 🔹 4. Переменные + useMemo
  // ─────────────────────────────────────────────────────────────
  const songData = useMemo(() => currentSong?.song, [currentSong]);
  const filteredEntries = useMemo(
    () => entryList?.filter(e => e.animeId === selectedAnimeId) || [],
    [entryList, selectedAnimeId]
  );

  const isGuessCorrect = useMemo(() => {
    if (!songData || !selectedAnimeId || !selectedEntryId) return null;
    return (
      selectedAnimeId === songData.animeId &&
      selectedEntryId === songData.animeEntryId &&
      opNumber === songData.orderNumber
    );
  }, [selectedAnimeId, selectedEntryId, opNumber, songData]);

  const selectedAnimeObj = useMemo(
    () => animeList?.find(a => a.id === selectedAnimeId),
    [animeList, selectedAnimeId]
  );

  // ─────────────────────────────────────────────────────────────
  // 🔹 5. Синхронные функции + коллбеки
  // ─────────────────────────────────────────────────────────────
  const clearSnippetTimer = useCallback(() => {
    if (snippetTimerRef.current) {
      clearTimeout(snippetTimerRef.current);
      snippetTimerRef.current = null;
    }
  }, []);

  const playSnippet = useCallback((start: number) => {
    const p = playerRef.current;
    if (!p) return;

    const timeSec = Math.max(0.1, start);

    // YouTube IFrame требует строгой последовательности:
    p.pause();
    p.currentTime = timeSec; 

    setTimeout(() => {
      setTimeout(() => p.play(), 100);
    }, 50);

    if (snippetTimerRef.current) clearTimeout(snippetTimerRef.current);
    snippetTimerRef.current = setTimeout(() => p.pause(), snippetDuration + 150);
  }, [snippetDuration]);

  const handlePlayFromStart = useCallback(() => playSnippet(0), [playSnippet]);

  const handlePlayFromChorus = useCallback(() => playSnippet(songData?.chorusTiming || 0), [playSnippet, songData]);

  const handlePlayRandom = useCallback(() => {
    const max = songData?.startTiming || 90;
    const randomMs = Math.floor(Math.random() * max);
    playSnippet(randomMs);
  }, [playSnippet, songData]);

  const handleGuess = useCallback(() => {
    if (isGuessCorrect !== null) setGuessResult(isGuessCorrect ? 'success' : 'fail');
  }, [isGuessCorrect]);

  const handleRevealInfo = useCallback(() => {
    setIsInfoRevealed(true);
    clearSnippetTimer();
    setGuessResult(null);
    playerRef.current?.play(); // Запускаем полный просмотр
  }, [clearSnippetTimer]);

  const resetSession = useCallback(() => {
    clearSnippetTimer();
    setIsInfoRevealed(false);
    setGuessResult(null);
    setFeedbackQuality(null);
    setSelectedAnimeId('');
    setSelectedEntryId('');
    setOpNumber(1);
  }, [clearSnippetTimer]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 6. Асинхронные функции + коллбеки
  // ─────────────────────────────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    await Promise.all([
      getAnimeList(),
      getLearnNextSong(),
    ]);
  }, []);

  const loadEntriesForAnime = useCallback(async (animeId: string) => {
    if (!animeId) return;
    setFilter({ animeId, skipCount: 0, maxResultCount: 50 });
    await getEntryList();
  }, []);

  const handleSubmitFeedback = useCallback(async (quality: LearnReviewQuality) => {
    if (!currentSong?.song.id) return;
    setFeedbackQuality(quality);
    try {
      await submitReview({ songId: currentSong.song.id, quality });
      // Сброс UI для следующего трека
      setTimeout(() => {
        setIsInfoRevealed(false);
        setGuessResult(null);
        setFeedbackQuality(null);
        setSelectedAnimeId('');
        setSelectedEntryId('');
        setOpNumber(1);
      }, 300);
    } catch (e) {
      console.error('❌ Submit review failed:', e);
    }
  }, [currentSong]);

  const handleNextSong = useCallback(async () => {
    resetSession();
    try {
      await getLearnNextSong();
    } catch (e) {
      console.error('❌ Failed to fetch next song:', e);
    }
  }, [resetSession, getLearnNextSong]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 7. useEffect
  // ─────────────────────────────────────────────────────────────
  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  useEffect(() => {
    if (selectedAnimeId) loadEntriesForAnime(selectedAnimeId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else { setSelectedEntryId(''); setOpNumber(1); }
  }, [selectedAnimeId, loadEntriesForAnime]);

  useEffect(() => {
    // Очистка таймера при размонтировании
    return () => clearSnippetTimer();
  }, [clearSnippetTimer]);

  // ─────────────────────────────────────────────────────────────
  // 🔹 8. Render
  // ─────────────────────────────────────────────────────────────
  if (isLoading || !songData) {
    return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><Skeleton variant="rectangular" height={300} width="100%" /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        🎧 Учебный режим <Chip label={currentSong?.isNew ? 'Новый' : `Повтор: ${currentSong?.reviewCount}`} size="small" sx={{ ml: 1 }} />
      </Typography>

      {/* 🔹 Плеер */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3, position: 'relative' }}>
        {/* 🔹 Контейнер с фиксированным соотношением 16:9 */}
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
    
          <VideoPlayer
            ref={playerRef}
            src={songData?.youtubeUrl || ''}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            playing={false}
            loop={false}
            controls={isInfoRevealed}
            config={{ youtube: { playerVars: { controls: 0, modestbranding: 1, disablekb: 1 } } as any}}
          />

          {/* 🖼 Заглушка поверх плеера */}
          {!isInfoRevealed && (
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'grey.900', borderRadius: 2, zIndex: 1
            }}>
              <Typography color="grey.400" align="center" sx={{ px: 2 }}>
                🎧 Слушай сниппеты, чтобы угадать аниме
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 🔹 Кнопки проигрывания сниппетов (скрыты после раскрытия инфы) */}
      {!isInfoRevealed && (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Button size="small" startIcon={<PlayArrowIcon />} onClick={handlePlayFromStart} disabled={!songData.youtubeUrl}>С начала</Button>
          <Button size="small" startIcon={<SkipNextIcon />} onClick={handlePlayFromChorus} disabled={!songData.chorusTiming}>С припева</Button>
          <Button size="small" startIcon={<ShuffleIcon />} onClick={handlePlayRandom} disabled={!songData.youtubeUrl}>Рандом</Button>
        </Box>
      )}

      {/* 🔹 Настройка длительности */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, px: 2 }}>
        <Typography variant="body2" color="text.secondary">Длительность проигрыша:</Typography>
        <Slider
          size="small"
          value={snippetDuration / 1000}
          min={1}
          max={15}
          step={1}
          onChange={(_, v) => setSnippetDuration((v as number) * 1000)}
          valueLabelDisplay="auto"
          sx={{ flex: 1 }}
        />
        <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>{snippetDuration / 1000}с</Typography>
      </Box>

      {/* 🔹 Селекты для угадывания */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 100px' }, gap: 2, mb: 3 }}>
        <FormControl size="small">
          <InputLabel>Аниме</InputLabel>
          <Autocomplete
            options={animeList || []}
            getOptionLabel={(opt) => opt.title}
            value={selectedAnimeObj}
            onChange={(_, newVal) => {
              const newId = newVal?.id || '';
              setSelectedAnimeId(newId);
              // Сброс зависимых полей при смене аниме
              setSelectedEntryId('');
              setOpNumber(1);
              if (newId) loadEntriesForAnime(newId);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Аниме" size="small" placeholder="Начни вводить название..." />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id} style={{ fontWeight: option.id === selectedAnimeId ? 600 : 400 }}>
                {option.title}
              </li>
            )}
            disableClearable
            sx={{ minWidth: 0 }}
          />
        </FormControl>

        <FormControl size="small">
          <InputLabel>Сезон</InputLabel>
          <Select value={selectedEntryId} label="Сезон" onChange={e => setSelectedEntryId(e.target.value)} disabled={!selectedAnimeId}>
            <MenuItem value="" disabled>Выберите сезон</MenuItem>
            {filteredEntries.map(e => <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="№ OP"
          type="number"
          value={opNumber}
          onChange={e => setOpNumber(Number(e.target.value))}
          inputProps={{ min: 1, max: 10 }}
        />
      </Box>

      {/* 🔹 Кнопки действий */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
        {!isInfoRevealed && (
          <Button variant="contained" size="large" onClick={handleGuess} disabled={!selectedAnimeId || !selectedEntryId || isLoading}>
            Угадать
          </Button>
        )}
        <Button variant="outlined" size="large" startIcon={<InfoIcon />} onClick={handleRevealInfo} disabled={isLoading}>
          {isInfoRevealed ? 'Открыть в плеере' : 'Открыть инфу'}
        </Button>
  
        {/* 🆕 Кнопка "Следующий OP" */}
        <Button 
          variant="contained" 
          color="secondary" 
          size="large" 
          startIcon={<SkipNextIcon />} 
          onClick={handleNextSong} 
          disabled={isLoading}
        >
          {isLoading ? 'Загрузка...' : 'Следующий OP'}
        </Button>
      </Box>

      {/* 🔹 Результат угадывания */}
      {guessResult && (
        <Alert severity={guessResult === 'success' ? 'success' : 'error'} sx={{ mb: 3 }}>
          {guessResult === 'success' ? '✅ Верно! Отличное знание.' : '❌ Не угадал. Изучи детали ниже.'}
        </Alert>
      )}

      {/* 🔹 Раскрытая информация + Фидбек */}
      {isInfoRevealed && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Информация о треке</Typography>
          <Typography variant="body1"><b>Название:</b> {songData.songTitle}</Typography>
          <Typography variant="body2" color="text.secondary"><b>Исполнитель:</b> {songData.artist?.name}</Typography>
          <Typography variant="body2" color="text.secondary"><b>Аниме:</b> {songData.animeTitle} • <b>Сезон:</b> {songData.animeEntryTitle}</Typography>
          <Typography variant="body2" color="text.secondary"><b>Тип:</b> {songData.type === 0 ? 'OP' : songData.type === 1 ? 'ED' : 'OST'} #{songData.orderNumber}</Typography>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Как хорошо ты это знал?</Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { val: LearnReviewQuality.Forgot, label: 'Забыл', icon: <ThumbDownIcon /> },
                { val: LearnReviewQuality.Hard, label: 'Сложно', icon: <ThumbDownIcon /> },
                { val: LearnReviewQuality.Medium, label: 'Средне', icon: null },
                { val: LearnReviewQuality.Easy, label: 'Легко', icon: <ThumbUpIcon /> },
              ].map(btn => (
                <Button
                  key={btn.val}
                  variant={feedbackQuality === btn.val ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={btn.icon}
                  onClick={() => handleSubmitFeedback(btn.val)}
                  disabled={isSubmitting}
                >
                  {btn.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Paper>
      )}

      {isSubmitting && <Typography align="center" color="text.secondary">Отправляем оценку и загружаем следующий трек...</Typography>}
    </Box>
  );
};

export default observer(Learn);