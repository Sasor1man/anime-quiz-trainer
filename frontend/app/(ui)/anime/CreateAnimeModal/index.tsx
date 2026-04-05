'use client';

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Modal, TextField, Button, Typography, FormControl, InputLabel,
  Select, MenuItem, Chip, FormHelperText, CircularProgress, Alert
} from '@mui/material';
import { animeStore } from '../anime.store';
import { tagStore } from '../CreateTagModal/tag.store';
import { IAnimeDto } from '../anime.type';
import { ITag } from '../CreateTagModal/tag.type';

// 🔹 Форма требует минимум 1 тег, хотя в DTO поле опционально (для создания лучше требовать)
const createAnimeSchema = z.object({
  title: z.string().min(1, { message: 'Введите название' }),
  titleEn: z.string().min(1, { message: 'Введите название на английском' }),
  tagIds: z.array(z.string()).min(1, { message: 'Выберите хотя бы один тег' }),
});

type CreateAnimeFormData = z.infer<typeof createAnimeSchema>;

interface CreateAnimeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateAnimeModal = observer(({ open, onClose, onSuccess }: CreateAnimeModalProps) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAnimeFormData>({
    resolver: zodResolver(createAnimeSchema),
    defaultValues: { title: '', titleEn: '', tagIds: [] },
    mode: 'onChange',
  });

  const { createAnime, isLoading: animeLoading } = animeStore;
  const { tagList, isLoading: tagsLoading, getTagList } = tagStore;

  // 🔄 Загружаем теги при открытии
  useEffect(() => {
    if (open && !tagList?.length) getTagList();
  }, [open]);

  // 🧹 Сброс при закрытии
  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const onSubmit = async (data: CreateAnimeFormData) => {
    try {
      // 🔹 Формируем DTO строго по вашему интерфейсу IAnimeDto
      const dto: IAnimeDto = {
        title: data.title,
        titleEn: data.titleEn,
        tagIds: data.tagIds, // ✅ string[]
      };

      await createAnime(dto);
      reset();
      onClose();
      onSuccess?.();
    } catch (e: any) {
      console.error('❌ Ошибка создания аниме:', e);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95vw', sm: 500 },
          bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 3,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Добавить аниме</Typography>

        <TextField
          label="Название *"
          {...register('title')}
          error={!!errors.title}
          helperText={errors.title?.message}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Название на английском *"
          {...register('titleEn')}
          error={!!errors.titleEn}
          helperText={errors.titleEn?.message}
          fullWidth
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal" error={!!errors.tagIds}>
          <InputLabel id="tags-label">Теги *</InputLabel>
          <Controller
            name="tagIds"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                labelId="tags-label"
                label="Теги *"
                multiple
                value={value || []}
                onChange={(e) => {
                  const selected = e.target.value;
                  onChange(typeof selected === 'string' ? selected.split(',') : selected);
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((id) => {
                      const tag = tagList?.find((t) => t.id === id);
                      return tag ? <Chip key={id} label={tag.name} size="small" /> : null;
                    })}
                  </Box>
                )}
                disabled={tagsLoading}
              >
                {tagsLoading ? (
                  <MenuItem disabled><CircularProgress size={20} sx={{ mx: 2 }} /></MenuItem>
                ) : tagList?.length ? (
                  tagList.map((tag: ITag) => (
                    <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Теги не найдены</MenuItem>
                )}
              </Select>
            )}
          />
          {errors.tagIds && <FormHelperText>{errors.tagIds.message}</FormHelperText>}
        </FormControl>

        {animeLoading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <CircularProgress size={16} sx={{ mr: 1 }} /> Создание...
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onClose} variant="outlined" disabled={animeLoading}>Отмена</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || animeLoading || tagsLoading}
          >
            {isSubmitting || animeLoading ? 'Создание...' : 'Создать'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
});

export default CreateAnimeModal;