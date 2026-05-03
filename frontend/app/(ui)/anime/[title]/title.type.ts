import { FilterRequestDto } from '@/types/filterRequestDto'

export interface AnimeEntryDto {
  title: string,
  titleEn: string,
  type: AnimeType,
  animeId: string
}

export interface AnimeEntryInfo extends AnimeEntryDto{
  id: string,
  animeTitle: string,
  createdAt: Date
}

export interface AnimeEntryFilter extends FilterRequestDto {
  animeId: string
}

export interface AnimeEntryOpeningsFilter extends FilterRequestDto {
  animeEntryId: string
}

export enum AnimeType
{
  TV = 1,
  Movie = 2,
  OVA = 3,
  ONA = 4,
  Special = 5
}