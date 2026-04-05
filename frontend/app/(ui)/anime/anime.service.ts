import { IAnime } from './anime.type'
import API from '@/service/api'
import { http } from '@/service/httpService'
import { FilterRequestDto } from '@/types/filterRequestDto'
import { PageFilteredDto } from '@/types/pageFilteredDto'

class AnimeService {
  getAnimeList = async (filter: FilterRequestDto): Promise<PageFilteredDto<IAnime>> => {
    const result = await http.get<PageFilteredDto<IAnime>>(`${API.Anime}`, filter)

    return result
  }

}

export const animeService = new AnimeService()