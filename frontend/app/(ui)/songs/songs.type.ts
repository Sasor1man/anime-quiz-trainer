import { IArtist } from '../artists/artists.type'

export interface SongDto {
  animeEntryId: string,
  artistId: string,
  songTitle: string,
  youtubeUrl: string,
  type: SongType,
  orderNumber: number,
  difficulty: number,
  startTiming: number,
  chorusTiming: number
}

export enum SongType {
  op,
  ed,
  ost
}

export interface ISong extends SongDto{
  id: string,
  animeEntryTitle: string,
  animeId: string,
  animeTitle: string,
  artist: IArtist,
  createdAt: Date
}