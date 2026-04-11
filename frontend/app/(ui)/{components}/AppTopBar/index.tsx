'use client'

import { AppBar, Button, Popover, Toolbar } from '@mui/material';
import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import Link from 'next/link';
import styles from './styles.module.scss'
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';
import { authStore } from '@/Auth/auth.store';

const AppTopBar: FC = () => {

  const {isLogged, currentUser, logoutUser} = authStore

  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const register = () => {
    setRegisterOpen((prev) => !prev)
  }

  const login = () => {
    setLoginOpen((prev) => !prev)
  }

  const logOut = () => {
    logoutUser()
  }

  const handlePopoverClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);

    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);

    setPopoverOpen(false);
  };


  return ( 
    <>
      <AppBar className={styles.appBar} position="static">
        <Toolbar className={styles.toolbar}>
          <div>
            <Button>
              <Link
                href={'/anime'}
              >
                Аниме
              </Link>
            </Button>
            <Button>
              <Link
                href={'/artists'}
              >
                Исполнители
              </Link>
            </Button>
            <Button>
              <Link
                href={'/songs'}
              >
                Песни
              </Link>
            </Button>
          </div>
          <div>
            {
              isLogged ? (
                <>
                  <Button 
                    onClick={handlePopoverClick}
                  >
                    {currentUser?.user.username}
                  </Button>
                  <Popover
                    open={isPopoverOpen}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                  >
                    <Button onClick={logOut}>Logout</Button>
                  </Popover>
                </>
              ) : (
                <>
                  <Button 
                    onClick={login}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={register}>
                    Register
                  </Button>
                </>
              )
            }
          </div>
        </Toolbar>
      </AppBar>

      <RegisterModal open={registerOpen} onClose={register}/>
      <LoginModal open={isLoginOpen} onClose={login}/>
    </>
  );
}
 
export default observer(AppTopBar);