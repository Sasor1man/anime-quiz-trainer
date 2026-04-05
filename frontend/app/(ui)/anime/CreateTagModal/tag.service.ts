import { ITag } from '../anime.type'
import API from '@/service/api'
import { http } from '@/service/httpService'
import { FilterRequestDto } from '@/types/filterRequestDto'
import { PageFilteredDto } from '@/types/pageFilteredDto'

class TagService {
  getTagList = async (filter: FilterRequestDto): Promise<PageFilteredDto<ITag>> => {
    const result = await http.get<PageFilteredDto<ITag>>(`${API.Tag}`, filter)

    return result
  }

  createTag = async (name: string) => {
    const result = await http.post<PageFilteredDto<ITag>>(`${API.Tag}`, {name: name})

    return result
  }

  updateTag = async (tag: ITag) => {
    const result = await http.put<PageFilteredDto<ITag>>(`${API.Tag}${tag.id}`, tag)

    return result
  }

  deleteTag = async (tagId: string) => {
    const result = await http.delete<PageFilteredDto<ITag>>(`${API.Tag}${tagId}`)

    return result
  }
}

export const tagService = new TagService()