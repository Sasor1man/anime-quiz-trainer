import { SongDifficulty, SongType } from './songs.type';
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

export const difficultyConfig: Record<SongDifficulty, IDefaultConfig> = {
  [SongDifficulty.VeryEasy]: { label: 'Очень легко', },
  [SongDifficulty.Easy]: { label: 'Легко', },
  [SongDifficulty.Medium]: { label: 'Средне', },
  [SongDifficulty.Hard]: { label: 'Сложно', },
  [SongDifficulty.VeryHard]: { label: 'Очень сложно', }
};

export const songDifficultyArray: SongDifficulty[] = [SongDifficulty.VeryEasy, SongDifficulty.Easy, SongDifficulty.Medium, SongDifficulty.Hard, SongDifficulty.VeryHard]
