export interface ILearnReviewDTO {
  songId: string,
  quality: LearnReviewQuality
}

export enum LearnReviewQuality {
  Forgot,
  Hard,
  Medium,
  Easy
}