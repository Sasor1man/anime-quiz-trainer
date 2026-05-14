'use client';

import { AppBar, Button, Popover, Toolbar } from '@mui/material';
import { FC, useState, useCallback } from 'react';
import { observer } from 'mobx-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 🔹 Импорт роутера
import styles from './styles.module.scss';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';
import { authStore } from '@/Auth/auth.store';

const AppTopBar: FC = observer(() => {
  const router = useRouter(); // 🔹 Хук роутинга
  const { isLogged, currentUser, logoutUser } = authStore;

  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenRegister = useCallback(() => setRegisterOpen(true), []);
  const handleCloseRegister = useCallback(() => setRegisterOpen(false), []);
  const handleOpenLogin = useCallback(() => setLoginOpen(true), []);
  const handleCloseLogin = useCallback(() => setLoginOpen(false), []);

  const handlePopoverClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setPopoverOpen(true);
  };

  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
    setPopoverOpen(false);
  }, []);

  // 🔹 FIX: Асинхронный логаут + переход на главную
  const handleLogout = useCallback(async () => {
    try {
      await logoutUser(); // Ждем очистки стора и localStorage
      router.replace('/'); // replace предотвращает возврат "назад" после логаута
    } catch (e) {
      console.error('❌ Logout failed:', e);
    } finally {
      handlePopoverClose(); // Закрываем поповер в любом случае
    }
  }, [logoutUser, router, handlePopoverClose]);

  return (
    <>
      <AppBar className={styles.appBar} position="static">
        <Toolbar className={styles.toolbar}>
          <div>
            <Button component={Link} href="/" className={styles.navButton}>Главная</Button>
            <Button component={Link} href="/anime" className={styles.navButton}>Аниме</Button>
            <Button component={Link} href="/artists" className={styles.navButton}>Исполнители</Button>
            <Button component={Link} href="/songs" className={styles.navButton}>Песни</Button>
          </div>

          <div>
            {isLogged ? (
              <>
                <Button onClick={handlePopoverClick}>{currentUser?.user.username}</Button>
                <Popover
                  open={isPopoverOpen}
                  anchorEl={anchorEl}
                  onClose={handlePopoverClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                  <Button onClick={handleLogout}>Logout</Button>
                </Popover>
              </>
            ) : (
              <>
                <Button onClick={handleOpenLogin}>Login</Button>
                <Button onClick={handleOpenRegister}>Register</Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>

      <RegisterModal open={registerOpen} onClose={handleCloseRegister} />
      <LoginModal open={isLoginOpen} onClose={handleCloseLogin} />
    </>
  );
});

export default AppTopBar;