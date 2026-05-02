import { ISong } from '../songs/songs.type';

export interface IQuizSong {
  song: ISong,
  isNew: boolean,
  reviewCount: number
}