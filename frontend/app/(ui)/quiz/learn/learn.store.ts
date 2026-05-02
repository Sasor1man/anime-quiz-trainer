import { makeAutoObservable, runInAction } from 'mobx';
import { IQuizSong } from '../quiz.type';
import { ILearnReviewDTO } from './learn.type';
import { learnService } from './learn.service';

class LearnStore {
  constructor() {
    makeAutoObservable(this);
  }

  currentSong?: IQuizSong;
  isLoading = false;
  isSubmitting = false;

  // 🎵 Получить следующий трек для изучения
  getLearnNextSong = async () => {
    this.isLoading = true;
    try {
      const data = await learnService.getLearnNextSong();
      runInAction(() => { this.currentSong = data; });
    } catch (e) {
      console.error('❌ Failed to fetch next song:', e);
      throw e;
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  };

  // ✅ Отправить оценку и сразу перейти к следующему
  submitReview = async (dto: ILearnReviewDTO) => {
    this.isSubmitting = true;
    try {
      await learnService.getLearnReview(dto);
      // Авто-загрузка следующего трека после успешной оценки
      await this.getLearnNextSong();
    } catch (e) {
      console.error('❌ Failed to submit review:', e);
      throw e;
    } finally {
      runInAction(() => { this.isSubmitting = false; });
    }
  };

  // 🔄 Сброс сессии (при выходе или перезапуске)
  reset = () => {
    runInAction(() => {
      this.currentSong = undefined;
      this.isLoading = false;
      this.isSubmitting = false;
    });
  };
}

export const learnStore = new LearnStore();