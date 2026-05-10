import { ISong, SongDifficulty, SongType } from '../../songs/songs.type';

export interface ITestSettings {
  count: number,
  difficulties: SongDifficulty[],
  tagIds: string[],
  songTypes: SongType[],
  startFrom: StartFrom,
  segmentSeconds: number
}

export interface ITestSongs {
  songs: ITestSong[],
  startFrom: StartFrom,
  segmentSeconds: number
}

export interface ITestSong {
  song: ISong,
  startAtSeconds: number
}

export enum StartFrom {
  Beginning,
  Chorus,
  Random
}