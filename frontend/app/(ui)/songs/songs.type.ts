import { IArtist } from '../artists/artists.type'

export interface SongDto {
  animeEntryId: string,
  artistId: string,
  songTitle: string,
  youtubeUrl: string,
  type: SongType,
  orderNumber: number,
  difficulty: SongDifficulty,
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



export enum SongDifficulty {
  VeryEasy = 1,
  Easy = 2,
  Medium = 3,
  Hard = 4,
  VeryHard = 5
}