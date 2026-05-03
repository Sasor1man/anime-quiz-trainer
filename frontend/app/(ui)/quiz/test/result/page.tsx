'use client';

import { FC, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Button, Stack, Chip,
  List, ListItem, ListItemText, ListItemIcon,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import { testStore } from '../test.store';

const TestResult: FC = () => {
  const router = useRouter();
  const { results, songs, score, totalQuestions, settings } = testStore;

  // 🔹 1. Защита роута: если тест не завершен → на главную
  useEffect(() => {
    if (!results.length || songs.length === 0) {
      router.replace('/quiz/test');
    }
  }, [results.length, songs.length, router]);

  // 🔹 2. Вычисление процента и "звания"
  const percentage = useMemo(() => Math.round((score / totalQuestions) * 100), [score, totalQuestions]);

  const grade = useMemo(() => {
    if (percentage >= 90) return { label: 'Легенда', color: 'success' as const };
    if (percentage >= 70) return { label: 'Знаток', color: 'primary' as const };
    if (percentage >= 50) return { label: 'Слушатель', color: 'warning' as const };
    return { label: 'Новичок', color: 'error' as const };
  }, [percentage]);

  // 🔹 3. Обработчики
  const handleRestart = async () => {
    if (settings) {
      await testStore.startTest(settings); // ✅ Сохраняет this
      router.push('/quiz/test/play');
    }
  };

  const handleToMenu = () => {
    testStore.reset(); // ✅ Сохраняет this
    router.push('/quiz/test');
  };

  // Если данных нет (защита от мигания до редиректа)
  if (!results.length) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
      
      {/* 🔹 Заголовок + Итоговый скор */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 1 }}>Результаты теста</Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h1" color={grade.color} sx={{ fontWeight: 800, lineHeight: 1 }}>
            {percentage}%
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            {score} из {totalQuestions} верно
          </Typography>
          <Chip 
            label={grade.label} 
            color={grade.color} 
            sx={{ mt: 2, px: 2, py: 0.5, fontSize: '1rem' }} 
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="outlined" 
            size="large" 
            startIcon={<HomeIcon />} 
            onClick={handleToMenu}
          >
            В меню
          </Button>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<ReplayIcon />} 
            onClick={handleRestart}
          >
            Пройти снова
          </Button>
        </Stack>
      </Paper>

      {/* 🔹 Детальный разбор ответов */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, pb: 1 }}>Разбор треков:</Typography>
        <Divider />
        
        <List sx={{ p: 0 }}>
          {results.map((res, index) => {
            // Если в results нет полных данных, берем из songs (fallback)
            const songInfo = songs[index]?.song;
            const isCorrect = res.isCorrect;

            return (
              <ListItem key={res.songId || index} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  {isCorrect ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: isCorrect ? 400 : 600 }}>
                      {res.songTitle || songInfo?.animeTitle || 'Неизвестный трек'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {songInfo?.songTitle} • {songInfo?.artist?.name || 'Artist'}
                    </Typography>
                  }
                />

                <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                  {isCorrect ? (
                    <Chip size="small" label="Верно" color="success" variant="outlined" />
                  ) : (
                    <Typography variant="body2" color="error">
                      OP {songInfo?.orderNumber}
                    </Typography>
                  )}
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default observer(TestResult);