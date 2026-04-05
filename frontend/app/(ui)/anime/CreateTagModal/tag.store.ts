import { makeAutoObservable, runInAction } from 'mobx'; // 🔑 Импортируем runInAction
import { tagService } from './tag.service';
import { ITag } from './tag.type';
import { FilterRequestDto } from '@/types/filterRequestDto';

const defaultFilter: FilterRequestDto = {
  filterText: '',
  skipCount: 0,
  maxResultCount: 10,
};

class TagStore {
  constructor() {
    makeAutoObservable(this);
  }

  tagList?: ITag[];
  totalCount?: number;
  isLoading = false;
  filter: FilterRequestDto = { ...defaultFilter };

  getTagList = async () => {
    // 🔑 Синхронные мутации до await работают внутри action автоматически
    this.isLoading = true;
    try {
      const data = await tagService.getTagList(this.filter);
      
      // 🔑 После await оборачиваем мутации в runInAction
      runInAction(() => {
        this.tagList = data.items;
        this.totalCount = data.totalCount;
      });
    } catch (e) {
      console.error('❌ Failed to fetch tags:', e);
    } finally {
      // 🔑 finally тоже после await → нужна обёртка
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  createTag = async (name: string) => {
    this.isLoading = true;
    try {
      await tagService.createTag(name);
      await this.getTagList(); // getTagList уже содержит runInAction внутри
    } catch (e) {
      console.error('❌ Failed to create tag:', e);
      throw e;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  updateTag = async (tag: ITag) => {
    this.isLoading = true;
    try {
      await tagService.updateTag(tag);
      await this.getTagList();
    } catch (e) {
      console.error('❌ Failed to update tag:', e);
      throw e;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  deleteTag = async (tagId: string) => {
    this.isLoading = true;
    try {
      await tagService.deleteTag(tagId);
      await this.getTagList();
    } catch (e) {
      console.error('❌ Failed to delete tag:', e);
      throw e;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // 🔑 Синхронные методы НЕ требуют runInAction (makeAutoObservable сам оборачивает их)
  setFilter = (newFilter: FilterRequestDto) => {
    this.filter = { ...this.filter, ...newFilter };
  };

  resetFilter = () => {
    this.filter = { ...defaultFilter };
  };
}

export const tagStore = new TagStore();