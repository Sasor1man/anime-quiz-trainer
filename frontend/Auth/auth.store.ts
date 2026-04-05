import { makeAutoObservable, runInAction } from 'mobx';
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
  private isHydrated = false;

  constructor() {
    makeAutoObservable(this);
  }

  hydrate() {
    if (this.isHydrated) return;

    const token = storage.getItem('refreshToken');
    if (token) {
      this.isLogged = true;
      this.isAdmin = storage.getItem('isAdmin') === 'true';
      this.refreshToken();
    }
    this.isHydrated = true;
  }

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
      const token = storage.getItem('refreshToken');
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
    });

    if (this.isAdmin) storage.setItem('isAdmin', 'true');
    storage.setItem('refreshToken', data.refreshToken);
    storage.setItem('accessToken', data.accessToken);
  };
}

export const authStore = new AuthStore();