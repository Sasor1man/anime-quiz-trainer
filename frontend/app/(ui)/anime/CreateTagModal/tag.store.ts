import { makeAutoObservable } from 'mobx';
import { ITag } from '../anime.type';
import { tagService } from './tag.service';
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
    this.isLoading = true;
    try {
      const data = await tagService.getTagList(this.filter);
      this.tagList = data.items;
      this.totalCount = data.totalCount;
    } catch (e) {
      console.error('❌ Failed to fetch tags:', e);
    } finally {
      this.isLoading = false;
    }
  };

  createTag = async (name: string) => {
    this.isLoading = true;
    try {
      await tagService.createTag(name);
      await this.getTagList(); 
    } catch (e) {
      console.error('❌ Failed to create tag:', e);
      throw e; 
    } finally {
      this.isLoading = false;
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
      this.isLoading = false;
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
      this.isLoading = false;
    }
  };

  setFilter = (newFilter: FilterRequestDto) => {
    this.filter = { ...this.filter, ...newFilter };
  };

  resetFilter = () => {
    this.filter = { ...defaultFilter };
  };
}

export const tagStore = new TagStore();