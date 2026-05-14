import { makeAutoObservable, runInAction } from 'mobx';
import dayjs from 'dayjs';
import { ICreateUserDto, IUser } from './auth.type';
import { authService } from './auth.service';

const storage = {
  getItem: (key: string) => typeof window !== 'undefined' ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string) => typeof window !== 'undefined' ? localStorage.setItem(key, value) : undefined,
  clear: () => typeof window !== 'undefined' ? localStorage.clear() : undefined,
};

class AuthStore {
  isLogged = false;

  isAdmin = false;

  currentUser: IUser | null = null;

  accessToken?: string;


  private isHydrated = false;

  constructor() {
    makeAutoObservable(this);
  }

  hydrate = async () => {
    if (this.isHydrated) return;
    this.isHydrated = true;

    try {
      const userJson = storage.getItem('userData');
      if (!userJson) return;

      const userInfo: IUser = JSON.parse(userJson);
    
      runInAction(() => {
        this.currentUser = userInfo;
        this.isLogged = true;
        this.isAdmin = userInfo.user?.isAdmin === true;
        this.accessToken = userInfo.accessToken;
      });
    
      if (!dayjs(userInfo.expiresAt).isAfter(dayjs())) {
        this.refreshToken().catch(() => {
          console.warn('⚠️ Token refresh failed during hydrate');
        });
      }
    } catch(e) {
      console.error('❌ Hydrate failed:', e);
      this.logoutUser();
    }
  };

  createUser = async (userDto: ICreateUserDto) => {
    try {
      const user = await authService.registerUser(userDto);
      this.saveUserInfo(user);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  loginUser = async (loginDto: Partial<ICreateUserDto>) => {
    try {
      const user = await authService.loginUser(loginDto);
      this.saveUserInfo(user);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  refreshToken = async () => {
    try {
      const token = this.currentUser?.refreshToken;
      if (!token) return;

      const user = await authService.refreshToken(token);
      this.saveUserInfo(user);
    } catch (e) {
      console.error(e);
      this.logoutUser();
    }
  };

  logoutUser = async () => {
    try {
      if (this.currentUser?.refreshToken) {
        await authService.logOut(this.currentUser.refreshToken);
      }
    } catch (e) {
      console.error(e);
    } finally {
      runInAction(() => {
        this.currentUser = null;
        this.isLogged = false;
        this.isAdmin = false;
      });
      storage.clear();
    }
  };

  private saveUserInfo = (data: IUser) => {
    runInAction(() => {
      this.currentUser = data;
      this.isLogged = true;
      this.isAdmin = data.user?.isAdmin === true;
      this.accessToken = data.accessToken
    });

    const userJson = JSON.stringify(data)
    storage.setItem('userData', userJson);
  };
}

export const authStore = new AuthStore();