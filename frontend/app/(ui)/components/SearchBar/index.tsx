'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { SxProps, Theme } from '@mui/material/styles';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFieldProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  delay?: number;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
}

export function SearchField({
  onSearch,
  placeholder = 'Поиск...',
  delay = 500,
  isLoading = false,
  sx
}: SearchFieldProps) {
  const [input, setInput] = useState('');
  const debouncedValue = useDebounce(input, delay);

  // Автоматический поиск после паузы ввода
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(input); // Мгновенный поиск без ожидания дебаунса
    }
  };

  const handleClear = () => {
    setInput('');
    onSearch('');
  };

  return (
    <TextField
      fullWidth
      size="small"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={isLoading}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SearchIcon color="action" />
            )}
          </InputAdornment>
        ),
        endAdornment: input && !isLoading && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end" aria-label="Очистить">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={sx}
    />
  );
}