import { SongType } from './songs.type';
import { IDefaultConfig } from '@/types/defaultConfig';

export const songTypes: SongType[] = [SongType.op, SongType.ed, SongType.ost]

export const songTypesConfig: Record<SongType, IDefaultConfig> = {
  [SongType.op]: {
    label: 'Опениг'
  },
  [SongType.ed]: {
    label: 'Эндинг'
  }, [SongType.ost]: {
    label: 'Ост'
  },
}