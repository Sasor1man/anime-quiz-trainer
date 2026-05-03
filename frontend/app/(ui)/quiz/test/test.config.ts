import { SongDifficulty, StartFrom } from './test.type';
import { IDefaultConfig } from '@/types/defaultConfig';

export const startFromConfig: Record<StartFrom, IDefaultConfig> = {
  [StartFrom.Beginning] : {
    label: 'С начала',
  },
  [StartFrom.Chorus] : {
    label: 'С припева'
  },
  [StartFrom.Random] : {
    label: 'Рандом'
  }
}

export const startFromArray: StartFrom[] = [StartFrom.Beginning, StartFrom.Chorus, StartFrom.Random]

export const difficultyConfig: Record<SongDifficulty, IDefaultConfig> = {
  [SongDifficulty.VeryEasy]: { label: 'Очень легко', },
  [SongDifficulty.Easy]: { label: 'Легко', },
  [SongDifficulty.Medium]: { label: 'Средне', },
  [SongDifficulty.Hard]: { label: 'Сложно', },
  [SongDifficulty.VeryHard]: { label: 'Очень сложно', }
};

export const songDifficultyArray: SongDifficulty[] = [SongDifficulty.VeryEasy, SongDifficulty.Easy, SongDifficulty.Medium, SongDifficulty.Hard, SongDifficulty.VeryHard]
