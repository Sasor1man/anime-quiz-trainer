import { IQuizSong } from '../quiz.type';
import { ILearnReviewDTO } from './learn.type';
import { http } from '@/service/httpService';
import API from '@/service/api';

class LearnService {
  getLearnNextSong = async (): Promise<IQuizSong> => {
    const result = http.get<IQuizSong>(`${API.Quiz.Learn}next`);

    return result
  }

  getLearnReview = async (dto: ILearnReviewDTO) => {
    const result = http.post(`${API.Quiz.Learn}review`, dto);

    return result
  }
}
export const learnService = new LearnService();
