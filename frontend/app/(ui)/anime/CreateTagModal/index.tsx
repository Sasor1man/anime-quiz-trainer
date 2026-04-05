'use client';

import { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Modal, TextField, Button, Typography, List, ListItem,
  ListItemText, IconButton, Pagination, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { SearchField } from '../../components/SearchBar';
import { tagStore } from './tag.store';

const tagSchema = z.object({
  name: z.string().min(1, { message: 'Введите название тега' }),
});
type TagFormData = z.infer<typeof tagSchema>;

interface TagModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void
}

const CreateTagModal = ({ open, onClose, onSuccess }: TagModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: '' },
    mode: 'onChange'
  });

  // Деструктуризация для читаемости
  const { 
    getTagList, createTag, updateTag, deleteTag, 
    isLoading, tagList, totalCount, filter, setFilter 
  } = tagStore;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // 📊 Пагинация (читаем прямо из фильтра стора)
  const pageSize = filter.maxResultCount || 10;
  const currentPage = Math.floor((filter.skipCount || 0) / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

  // 🔄 Загрузка при открытии, сброс состояний при закрытии
  useEffect(() => {
    if (open) getTagList();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setLocalError(null);
    return () => { setEditingId(null); reset(); };
  }, [open]);

  // 🔍 Поиск (новый setFilter API)
  const handleSearch = useCallback((value: string) => {
    setFilter({ filterText: value, skipCount: 0 }); // Сброс на 1 страницу
    getTagList();
  }, []);

  // 📄 Переключение страниц
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilter({ skipCount: (page - 1) * pageSize });
    getTagList();
  };

  const onSubmit = async (data: TagFormData) => {
    setLocalError(null);
    try {
      if (editingId) {
        await updateTag({ id: editingId, name: data.name } as any);
        setEditingId(null);
        onSuccess?.();
      } else {
        await createTag(data.name);
      }
      reset();
      getTagList();
    } catch (e: any) {
      setLocalError(e.message || 'Ошибка при сохранении');
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setValue('name', currentName, { shouldValidate: true });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteTag(deleteTargetId);
      setDeleteTargetId(null);
      getTagList();
    } catch (e: any) {
      setLocalError(e.message || 'Ошибка удаления');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95vw', sm: 600 },
            bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 3,
            maxHeight: '90vh', overflowY: 'auto'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>Управление тегами</Typography>

          <SearchField
            onSearch={handleSearch}
            placeholder="Поиск по названию..."
            isLoading={isLoading}
            sx={{ mb: 2 }}
          />

          {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}

          {/* 📜 Список тегов */}
          <Box sx={{ maxHeight: 240, overflowY: 'auto', mb: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {isLoading && !tagList?.length ? (
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
            ) : tagList?.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ p: 2 }}>Теги не найдены</Typography>
            ) : (
              <List dense disablePadding>
                {tagList?.map((tag) => (
                  <ListItem key={tag.id} divider sx={{ justifyContent: 'space-between' }}>
                    <> {/* 🔑 Фрагмент исправляет TS-ошибку с multiple children */}
                      <ListItemText primary={tag.name} />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => startEdit(tag.id, tag.name)} disabled={isLoading}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteTargetId(tag.id)} disabled={isLoading} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* 📄 Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            </Box>
          )}

          {/* ✏️ Форма */}
          <TextField
            label={editingId ? 'Обновить название' : 'Добавить тег'}
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: editingId ? (
                <IconButton size="small" onClick={cancelEdit} edge="end">
                  <CloseIcon />
                </IconButton>
              ) : undefined
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
            <Button onClick={onClose} variant="outlined">Закрыть</Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={editingId ? <CheckIcon /> : undefined}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Сохранение...' : editingId ? 'Обновить' : 'Создать'}
            </Button>
          </Box>
        </Box>

        {/* 🗑 Диалог удаления */}
        <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}>
          <DialogTitle>Удалить тег?</DialogTitle>
          <DialogContent>
            <DialogContentText>Действие нельзя отменить. Тег будет удалён навсегда.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTargetId(null)}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Удалить</Button>
          </DialogActions>
        </Dialog>
      </div>
    </Modal>
  );
};

export default observer(CreateTagModal);