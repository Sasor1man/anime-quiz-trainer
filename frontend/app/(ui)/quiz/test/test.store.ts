import { makeAutoObservable, runInAction } from 'mobx';
import { ISong } from '../../songs/songs.type';
import { testService } from './test.service';
import { ITestSettings, ITestSongs, ITestSong } from './test.type';

// Внутренний интерфейс для хранения результатов ответа
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
  // 🔹 2. Состояние
  // ─────────────────────────────────────────────────────────────
  settings: ITestSettings | null = null;
  songs: ITestSong[] = [];
  currentIndex: number = 0;
  results: ITestResult[] = [];
  
  isRunning: boolean = false;
  isFinished: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  // ─────────────────────────────────────────────────────────────
  // 🔹 3. Computed (Вычисляемые поля)
  // ─────────────────────────────────────────────────────────────
  get currentSong(): ITestSong | null {
    if (!this.isRunning || this.songs.length === 0) return null;
    return this.songs[this.currentIndex] || null;
  }

  get currentSongData(): ISong | null {
    return this.currentSong?.song || null;
  }

  // Для плеера: с какой секунды начинать
  get currentStartTime(): number {
    return this.currentSong?.startAtSeconds ?? 0;
  }

  get progressPercent(): number {
    if (this.songs.length === 0) return 0;
    return Math.round(((this.currentIndex) / this.songs.length) * 100);
  }

  get score(): number {
    return this.results.filter(r => r.isCorrect).length;
  }

  get totalQuestions(): number {
    return this.songs.length;
  }

  // ─────────────────────────────────────────────────────────────
  // 🔹 4. Синхронные методы (СНАЧАЛА СИНХРОННОСТЬ)
  // ─────────────────────────────────────────────────────────────
  checkAnswer(animeId: string, entryId: string, opNumber: number): boolean {
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

    return isCorrect;
  }

  nextSong() {
    if (this.currentIndex < this.songs.length - 1) {
      this.currentIndex++;
    } else {
      this.isFinished = true;
      this.isRunning = false;
    }
  }

  reset() {
    this.settings = null;
    this.songs = [];
    this.currentIndex = 0;
    this.results = [];
    this.isRunning = false;
    this.isFinished = false;
    this.error = null;
  }

  // ─────────────────────────────────────────────────────────────
  // 🔹 5. Асинхронные методы (ПОТОМ АСИНХРОННОСТЬ)
  // ─────────────────────────────────────────────────────────────
  async startTest(dto: ITestSettings) {
    this.isLoading = true;
    this.error = null;
    this.reset();

    try {
      const result: ITestSongs = await testService.quizStart(dto);
      
      runInAction(() => {
        this.settings = dto;
        this.songs = result.songs;
        this.isRunning = true;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.message || 'Ошибка запуска теста';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

export const testStore = new TestStore();