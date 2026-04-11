import { AnimeEntryOpeningsFilter } from '../anime/[title]/title.type';
import { ISong, SongDto } from './songs.type';
import { FilterRequestDto } from '@/types/filterRequestDto';
import { PageFilteredDto } from '@/types/pageFilteredDto';
import { http } from '@/service/httpService';
import API from '@/service/api';

class SongsService {
  getSongsList = async (filter: FilterRequestDto): Promise<PageFilteredDto<ISong>> => {
    const result = http.get<PageFilteredDto<ISong>>(`${API.Song}`, filter);

    return result
  }

  createSong = async(song: SongDto) => {
    const result = await http.post<PageFilteredDto<ISong>>(`${API.Song}`, song);
  
    return result;
  }
  
  getCurrentSong = async (songId: string): Promise<ISong> => {
    const result = await http.get<ISong>(`${API.Song}${songId}`);
  
    return result;
  }
  
  updateSong = async(song: SongDto, id: string) => {
    const result = await http.put<PageFilteredDto<ISong>>(`${API.Song}${id}`, song);
  
    return result;
  }
  
  deleteSong = async(songId: string) => {
    const result = await http.delete(`${API.Song}${songId}`);
  
    return result;
  }

  getSongByEntry = async (filter: AnimeEntryOpeningsFilter): Promise<PageFilteredDto<ISong>> => {
    const result = http.get<PageFilteredDto<ISong>>(`${API.Song}by-anime-entry/${filter.animeEntryId}`, filter);

    return result
  }
}
export const songsService = new SongsService();
