import { ReactNode } from 'react'

export interface IAnime {
  id: string,
  title: string,
  titleEn: string,
  createdAt: Date,
  tags: ITag[]
}

export interface ITag {
  id: string,
  name: string
}

export interface IAction {
  icon: ReactNode,
  name: string
  onClick: () => void
}