import { FilterRequestDto } from '@/types/filterRequestDto'

export interface AnimeEntryDto {
  title: string,
  titleEn: string,
  type: number,
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