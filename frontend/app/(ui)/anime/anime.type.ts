import { ReactNode } from 'react'
import { ITag } from './CreateTagModal/tag.type'

export interface IAnime extends IAnimeDto {
  id: string,
  createdAt: Date,
  tags: ITag[]
}

export interface IAction {
  icon: ReactNode,
  name: string
  onClick: () => void
}

export interface IAnimeDto {
  title: string,
  titleEn: string,
  tagIds?: string[]
}