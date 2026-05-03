'use client';

import { FC, useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Slider, Chip, Button,
  FormControl, Alert, CircularProgress,
  Stack, Divider
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { SongType } from '../../songs/songs.type';
import { songTypes, songTypesConfig } from '../../songs/songs.config';
import { tagStore } from '../../anime/CreateTagModal/tag.store';
import { testStore } from './test.store';
import { ITestSettings, SongDifficulty, StartFrom } from './test.type';
import { difficultyConfig, songDifficultyArray, startFromArray, startFromConfig } from './test.config';

const TestSettings: FC = () => {
  const router = useRouter();
  const { isLoading, error } = testStore;

  // 🔹 Начальное состояние формы
  const [form, setForm] = useState<ITestSettings>({
    count: 10,
    difficulties: [SongDifficulty.Easy, SongDifficulty.Medium],
    tagIds: [], // 👈 В будущем замени на данные из tagStore
    songTypes: [SongType.op],
    startFrom: StartFrom.Random,
    segmentSeconds: 5,
  });

  // 🔹 Переключатели для массивов (Chip-группы)
  const toggleArrayValue = <T,>(key: keyof ITestSettings, value: T) => {
    setForm((prev) => {
      const arr = prev[key] as T[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  // 🔹 Обновление одиночных полей
  const updateField = <K extends keyof ITestSettings>(key: K, value: ITestSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 Запуск теста
  const handleStartTest = useCallback(async () => {
    await testStore.startTest(form);
    // Если ошибок нет → идем на страницу прохождения
    if (!testStore.error) {
      router.push('/quiz/test/play');
    }
  }, [form, router]);

  // 🔹 Загрузка тегов при первом рендере
  useEffect(() => {
    tagStore.getTagList();
    return () => tagStore.resetFilter();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
        🎯 Настройки теста
      </Typography>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 🔹 1. Основные параметры */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography variant="h6">Общее</Typography>
          
          {/* Количество треков */}
          <Box>
            <Typography gutterBottom>Количество песен: <b>{form.count}</b></Typography>
            <Slider
              value={form.count}
              min={5}
              max={30}
              step={5}
              valueLabelDisplay="auto"
              onChange={(_, v) => updateField('count', v as number)}
            />
          </Box>

          {/* Откуда начинать */}
          <FormControl component="fieldset">
            <Typography gutterBottom color="text.secondary">Начинать воспроизведение с:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {startFromArray.map((key) => {
                const cfg = startFromConfig[key]

                return (
                  <Chip
                    key={key}
                    label={cfg.label}
                    variant={form.startFrom === key ? 'filled' : 'outlined'}
                    onClick={() => updateField('startFrom', key)}
                    sx={{ cursor: 'pointer' }}
                  />
                )})}
            </Stack>
          </FormControl>

          {/* Длительность сниппета */}
          <Box>
            <Typography gutterBottom>Длительность сниппета: <b>{form.segmentSeconds} сек</b></Typography>
            <Slider
              value={form.segmentSeconds}
              min={1}
              max={15}
              step={1}
              valueLabelDisplay="auto"
              onChange={(_, v) => updateField('segmentSeconds', v as number)}
            />
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* 🔹 2. Фильтры контента */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography variant="h6">Фильтры</Typography>

          {/* Сложность */}
          <FormControl fullWidth>
            <Typography gutterBottom>Сложность</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {songDifficultyArray.map((key) => {
                const cfg = difficultyConfig[key]

                return (
                  <Chip
                    key={key}
                    label={cfg.label}
                    variant={form.difficulties.includes(key) ? 'filled' : 'outlined'}
                    onClick={() => toggleArrayValue('difficulties', key)}
                    sx={{ cursor: 'pointer' }}
                  />
                )})}
            </Box>
          </FormControl>

          {/* Тип песни */}
          <FormControl fullWidth>
            <Typography gutterBottom>Тип трека</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {songTypes.map((type) => {
                const cfg = songTypesConfig[type]
                
                return(
                  <Chip
                    key={type}
                    label={cfg.label}
                    variant={form.songTypes.includes(type as any) ? 'filled' : 'outlined'}
                    onClick={() => toggleArrayValue('songTypes', type as any)}
                    sx={{ cursor: 'pointer' }}
                  />
                )})}
            </Box>
          </FormControl>

          {/* Теги (заглушка под будущий store) */}
          {/* Теги */}
          <FormControl fullWidth>
            <Typography gutterBottom>Жанры / Теги</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: 120, overflow: 'auto', p: 0.5 }}>
              {tagStore.tagList?.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  variant={form.tagIds.includes(tag.id) ? 'filled' : 'outlined'}
                  onClick={() => toggleArrayValue('tagIds', tag.id)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
              {tagStore.isLoading && <CircularProgress size={20} sx={{ m: 1 }} />}
              {!tagStore.isLoading && (!tagStore.tagList || tagStore.tagList.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  Нет доступных тегов
                </Typography>
              )}
            </Box>
          </FormControl>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* 🔹 3. Кнопка старта */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleStartTest}
            disabled={isLoading || form.difficulties.length === 0}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Загрузка...' : 'Начать тест'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default observer(TestSettings);