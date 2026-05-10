'use client';

import { FC } from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';
import { Box, Button, Typography, Container, Paper, Alert } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import { authStore } from '@/Auth/auth.store'; // 🔹 Импорт стора авторизации

const QuizPage: FC = observer(() => {
  // ─────────────────────────────────────────────────────────────
  // 🔹 1. Деструктуризация сторов
  // ─────────────────────────────────────────────────────────────
  const { isLogged } = authStore;

  // ─────────────────────────────────────────────────────────────
  // 🔹 2. Render
  // ─────────────────────────────────────────────────────────────
  
  // 🔹 Если не авторизован — показываем экран входа
  if (!isLogged) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2
          }}
        >
          <LoginIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
          
          <Typography variant="h5" fontWeight={600}>
            Требуется авторизация
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Чтобы получить доступ к квизам, пожалуйста, войдите в свой аккаунт
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            После входа вам станут доступны учебный режим и режим теста
          </Alert>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Button component={Link} href="/" startIcon={<ArrowBackIcon />} color="inherit">
            На главную
          </Button>
        </Box>
      </Container>
    );
  }

  // 🔹 Если авторизован — показываем выбор режима (оригинальный код)
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Выбор режима
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Тренируй слух без спешки или проверь знания на время
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 🔹 1. Учебный режим */}
        <Button
          component={Link}
          href="/quiz/learn"
          variant="contained"
          size="large"
          startIcon={<SchoolIcon />}
          sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
        >
          Учебный режим
        </Button>

        {/* 🔹 2. Режим теста */}
        <Button
          component={Link}
          href="/quiz/test"
          variant="outlined"
          size="large"
          startIcon={<QuizIcon />}
          sx={{ py: 1.5, textTransform: 'none', fontSize: '1rem' }}
        >
          Режим теста
        </Button>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Button component={Link} href="/" startIcon={<ArrowBackIcon />} color="inherit">
          На главную
        </Button>
      </Box>
    </Container>
  );
});

export default QuizPage;