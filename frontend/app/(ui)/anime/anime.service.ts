import { IAnime, IAnimeDto } from './anime.type'
import API from '@/service/api'
import { http } from '@/service/httpService'
import { FilterRequestDto } from '@/types/filterRequestDto'
import { PageFilteredDto } from '@/types/pageFilteredDto'

class AnimeService {
  getAnimeList = async (filter: FilterRequestDto): Promise<PageFilteredDto<IAnime>> => {
    const result = await http.get<PageFilteredDto<IAnime>>(`${API.Anime}`, filter)

    return result
  }

  getAnime = async (id: string): Promise<IAnime> => {
    const result = await http.get<IAnime>(`${API.Anime}${id}`)

    return result
  }

  createAnime = async (data: IAnimeDto): Promise<IAnime> => {
    const result = await http.post<IAnime>(`${API.Anime}`, data)

    return result
  }

  updateAnime = async (data: IAnimeDto, id: string): Promise<IAnime> => {
    const result = await http.post<IAnime>(`${API.Anime}${id}`, data)

    return result
  }

  deleteAnime =  async (id: string) => {
    const result = await http.delete(`${API.Anime}${id}`)

    return result
  }
}

export const animeService = new AnimeService()