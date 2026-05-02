'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Box, Button, Typography, Container } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const QuizPage: FC = () => {
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
          href="quiz/learn"
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
          href="quiz/test"
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
};

export default QuizPage;