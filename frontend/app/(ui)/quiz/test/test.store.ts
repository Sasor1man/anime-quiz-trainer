import { makeAutoObservable, runInAction } from 'mobx';
import { ISong } from '../../songs/songs.type';
import { testService } from './test.service';
import { ITestSettings, ITestSongs, ITestSong } from './test.type';

export interface ITestResult {
  songId: string;
  songTitle: string;
  isCorrect: boolean;
}

class TestStore {
  // ─────────────────────────────────────────────────────────────
  // 🔹 1. Constructor (ВСЕГДА ВВЕРХУ)
  // ─────────────────────────────────────────────────────────────
  constructor() {
    makeAutoObservable(this);
  }

  // ─────────────────────────────────────────────────────────────
  // 🔹 2. Состояние (включая "вычисляемые" как обычные поля)
  // ─────────────────────────────────────────────────────────────
  settings: ITestSettings | null = null;
  songs: ITestSong[] = [];
  currentIndex: number = 0;
  results: ITestResult[] = [];
  
  isRunning: boolean = false;
  isFinished: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  // 🔹 "Вычисляемые" значения как обычные observable-поля
  currentSong: ITestSong | null = null;
  currentSongData: ISong | null = null;
  currentStartTime: number = 0;
  progressPercent: number = 0;
  score: number = 0;
  totalQuestions: number = 0;

  // ─────────────────────────────────────────────────────────────
  // 🔹 3. Вспомогательный метод для обновления "вычисляемых" полей
  // ─────────────────────────────────────────────────────────────
  private updateComputed = () => {
    // currentSong
    if (!this.isRunning || this.songs.length === 0) {
      this.currentSong = null;
    } else {
      this.currentSong = this.songs[this.currentIndex] || null;
    }
    
    // currentSongData
    this.currentSongData = this.currentSong?.song || null;
    
    // currentStartTime
    this.currentStartTime = this.currentSong?.startAtSeconds ?? 0;
    
    // progressPercent
    this.progressPercent = this.songs.length === 0 
      ? 0 
      : Math.round(((this.currentIndex) / this.songs.length) * 100);
    
    // score
    this.score = this.results.filter(r => r.isCorrect).length;
    
    // totalQuestions
    this.totalQuestions = this.songs.length;
  };

  // ─────────────────────────────────────────────────────────────
  // 🔹 4. Синхронные методы (СТРЕЛОЧНЫЕ ФУНКЦИИ)
  // ─────────────────────────────────────────────────────────────
  checkAnswer = (animeId: string, entryId: string, opNumber: number): boolean => {
    if (!this.currentSong) return false;

    const correctSong = this.currentSong.song;
    const isCorrect = 
      animeId === correctSong.animeId &&
      entryId === correctSong.animeEntryId &&
      opNumber === correctSong.orderNumber;

    this.results.push({
      songId: correctSong.id,
      songTitle: correctSong.songTitle,
      isCorrect
    });

    this.updateComputed();
    return isCorrect;
  };

  nextSong = () => {
    if (this.currentIndex < this.songs.length - 1) {
      this.currentIndex++;
    } else {
      this.isFinished = true;
      this.isRunning = false;
    }
    this.updateComputed();
  };

  reset = () => {
    this.settings = null;
    this.songs = [];
    this.currentIndex = 0;
    this.results = [];
    this.isRunning = false;
    this.isFinished = false;
    this.error = null;
    this.updateComputed();
  };

  resetCurrentSong = () => {
    this.currentSong = null
  }

  // ─────────────────────────────────────────────────────────────
  // 🔹 5. Асинхронные методы (СТРЕЛОЧНЫЕ ФУНКЦИИ)
  // ─────────────────────────────────────────────────────────────
  startTest = async (dto: ITestSettings) => {
    this.isLoading = true;
    this.error = null;
    this.reset(); // reset() уже вызывает updateComputed()

    try {
      const result: ITestSongs = await testService.quizStart(dto);
      
      runInAction(() => {
        this.settings = dto;
        this.songs = result.songs;
        this.isRunning = true;
        this.updateComputed();
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message || 'Ошибка запуска теста';
        this.updateComputed();
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}

export const testStore = new TestStore();