import { ITestSettings, ITestSongs } from './test.type';
import { http } from '@/service/httpService';
import API from '@/service/api';

class TestService {
  quizStart = async (dto: ITestSettings): Promise<ITestSongs> => {
    const result = http.post<ITestSongs>(`${API.Quiz.Test}start`, dto);
        
    return result
  }
}
export const testService = new TestService();
