import { AnimeType } from './title.type';
import { IDefaultConfig } from '@/types/defaultConfig';

export const animeEntryTypes: AnimeType[] = [
  AnimeType.TV,
  AnimeType.Movie,
  AnimeType.OVA,
  AnimeType.ONA,
  AnimeType.Special
];

export const animeEntryTypesConfig: Record<AnimeType, IDefaultConfig> = {
  [AnimeType.TV]: { label: 'TV-сериал' },
  [AnimeType.Movie]: { label: 'Фильм' },
  [AnimeType.OVA]: { label: 'OVA' },
  [AnimeType.ONA]: { label: 'ONA' },
  [AnimeType.Special]: { label: 'Спешл' },
};