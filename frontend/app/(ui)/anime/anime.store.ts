import { makeAutoObservable } from 'mobx';
import { IAnime } from './anime.type';
import { animeService } from './anime.service';
import { FilterRequestDto } from '@/types/filterRequestDto';

const defaultFilter: FilterRequestDto = {
  filterText: '',
  skipCount: 0,
  maxResultCount: 10
}

class AnimeStore {
  constructor() {
    makeAutoObservable(this)
  }

  animeList?: IAnime[]

  totalCount?: number

  isLoading = false

  filter: FilterRequestDto = defaultFilter

  getAnimeList = async () => {
    this.isLoading = true;

    try {
      const data = await animeService.getAnimeList(this.filter)

      this.animeList = data.items
      this.totalCount = data.totalCount
    } catch(e) {
      console.error(e)
    } finally {
      this.isLoading = false
    }
  }
}

export const animeStore = new AnimeStore()