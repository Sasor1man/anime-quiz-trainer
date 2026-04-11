import { makeAutoObservable, runInAction } from 'mobx';
import { AnimeEntryOpeningsFilter } from '../anime/[title]/title.type'; // 👈 Проверьте путь к типу
import { SongDto, ISong } from './songs.type';
import { songsService } from './songs.service';
import { FilterRequestDto } from '@/types/filterRequestDto';

const defaultFilter: FilterRequestDto = {
  filterText: '',
  skipCount: 0,
  maxResultCount: 10,
};

class SongsStore {
  constructor() {
    makeAutoObservable(this);
  }

  songList?: ISong[];
  currentSong?: ISong;
  totalCount?: number;
  isLoading = false;
  filter: FilterRequestDto = { ...defaultFilter };

  // 📥 Общий список песен
  getSongsList = async (customFilter?: FilterRequestDto) => {
    this.isLoading = true;
    try {
      const filterToUse = customFilter || this.filter;
      const data = await songsService.getSongsList(filterToUse);
      runInAction(() => {
        this.songList = data.items;
        this.totalCount = data.totalCount;
      });
    } catch (e) {
      console.error('❌ Failed to fetch songs:', e);
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🎯 Получить одну песню
  getCurrentSong = async (id: string) => {
    this.isLoading = true;
    try {
      const data = await songsService.getCurrentSong(id);
      runInAction(() => { this.currentSong = data; });
    } catch (e) {
      console.error('❌ Failed to fetch song:', e);
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🎵 Получить песни конкретного сезона (OP/ED/OST)
  getSongsByEntry = async (filter: AnimeEntryOpeningsFilter) => {
    this.isLoading = true;
    try {
      const data = await songsService.getSongByEntry(filter);
      runInAction(() => {
        this.songList = data.items;
        this.totalCount = data.totalCount;
      });
    } catch (e) {
      console.error('❌ Failed to fetch songs by entry:', e);
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🆕 Создание
  createSong = async (dto: SongDto) => {
    this.isLoading = true;
    try {
      await songsService.createSong(dto);
      await this.getSongsList(); // Автообновление списка
    } catch (e) {
      console.error('❌ Failed to create song:', e);
      throw e; // Пробрасываем для обработки в UI
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // ✏️ Обновление
  updateSong = async (dto: SongDto, id: string) => {
    this.isLoading = true;
    try {
      await songsService.updateSong(dto, id);
      await this.getSongsList();
    } catch (e) {
      console.error('❌ Failed to update song:', e);
      throw e;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🗑 Удаление
  deleteSong = async (id: string) => {
    this.isLoading = true;
    try {
      await songsService.deleteSong(id);
      await this.getSongsList();
    } catch (e) {
      console.error('❌ Failed to delete song:', e);
      throw e;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🔍 Управление фильтрами (для общего списка)
  setFilter = (newFilter: FilterRequestDto) => {
    this.filter = { ...this.filter, ...newFilter };
  };

  resetFilter = () => {
    this.filter = { ...defaultFilter };
  };
}

export const songsStore = new SongsStore();