import { ISong, SongType } from '../../songs/songs.type';

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

export enum SongDifficulty {
  VeryEasy = 1,
  Easy = 2,
  Medium = 3,
  Hard = 4,
  VeryHard = 5
}

export enum StartFrom {
  Beginning,
  Chorus,
  Random
}