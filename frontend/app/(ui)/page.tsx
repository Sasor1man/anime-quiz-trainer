'use client'

import { Box, Button, Container, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
        Anime Quiz Trainer
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Тренируй знание аниме-опенингов и эндингов
      </Typography>

      {/* 🔹 Кнопка перехода в квиз */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          component={Link}
          href="/quiz"
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          sx={{ px: 4, py: 1.5 }}
        >
          Пройти квиз
        </Button>
        
        <Button
          component={Link}
          href="/anime"
          variant="outlined"
          size="large"
        >
          Каталог аниме
        </Button>
      </Box>
    </Container>
  );
}
