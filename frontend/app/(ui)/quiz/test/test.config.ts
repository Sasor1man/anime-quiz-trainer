import {  StartFrom } from './test.type';
import { IDefaultConfig } from '@/types/defaultConfig';

export const startFromConfig: Record<StartFrom, IDefaultConfig> = {
  [StartFrom.Beginning] : {
    label: 'С начала',
  },
  [StartFrom.Chorus] : {
    label: 'С припева'
  },
  [StartFrom.Random] : {
    label: 'Рандом'
  }
}

export const startFromArray: StartFrom[] = [StartFrom.Beginning, StartFrom.Chorus, StartFrom.Random]
