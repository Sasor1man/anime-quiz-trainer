import { makeAutoObservable, runInAction } from 'mobx';
import { IAnime, IAnimeDto } from './anime.type';
import { animeService } from './anime.service';
import { FilterRequestDto } from '@/types/filterRequestDto';

const defaultFilter: FilterRequestDto = {
  filterText: '',
  skipCount: 0,
  maxResultCount: 10,
};

class AnimeStore {
  constructor() {
    makeAutoObservable(this);
  }

  animeList?: IAnime[];
  currentAnime?: IAnime; // Для детального просмотра/редактирования
  totalCount?: number;
  isLoading = false;
  filter: FilterRequestDto = { ...defaultFilter }; // 🔒 Безопасная копия

  // 📥 Получение списка
  getAnimeList = async () => {
    this.isLoading = true;
    try {
      const data = await animeService.getAnimeList(this.filter);
      runInAction(() => {
        this.animeList = data.items;
        this.totalCount = data.totalCount;
      });
    } catch (e) {
      console.error('❌ Failed to fetch anime list:', e);
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🎯 Получение одного аниме
  getAnime = async (id: string) => {
    this.isLoading = true;
    try {
      const data = await animeService.getAnime(id);
      runInAction(() => { this.currentAnime = data; });
    } catch (e) {
      console.error('❌ Failed to fetch anime:', e);
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🆕 Создание
  createAnime = async (dto: IAnimeDto) => {
    this.isLoading = true;
    try {
      await animeService.createAnime(dto);
      await this.getAnimeList(); // Автообновление списка
    } catch (e) {
      console.error('❌ Failed to create anime:', e);
      throw e; // Пробрасываем для показа тоста/ошибки в UI
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // ✏️ Обновление
  updateAnime = async (dto: IAnimeDto, id: string) => {
    this.isLoading = true;
    try {
      await animeService.updateAnime(dto, id);
      await this.getAnimeList();
    } catch (e) {
      console.error('❌ Failed to update anime:', e);
      throw e;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🗑 Удаление
  deleteAnime = async (id: string) => {
    this.isLoading = true;
    try {
      await animeService.deleteAnime(id);
      await this.getAnimeList();
    } catch (e) {
      console.error('❌ Failed to delete anime:', e);
      throw e;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // 🔍 Управление фильтрами
  setFilter = (newFilter: FilterRequestDto) => {
    this.filter = { ...this.filter, ...newFilter };
  };

  resetFilter = () => {
    this.filter = { ...defaultFilter };
    this.getAnimeList();
  };
}

export const animeStore = new AnimeStore();