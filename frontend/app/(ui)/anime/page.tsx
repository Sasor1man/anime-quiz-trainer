'use client'

import { FC, useEffect, useState } from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import HdrAutoIcon from '@mui/icons-material/HdrAuto';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { observer } from 'mobx-react';
import { animeStore } from './anime.store';
import { IAction } from './anime.type';
import CreateAnimeModal from './CreateAnimeModal';
import CreateTagModal from './CreateTagModal';
import { authStore } from '@/Auth/auth.store';
 
const AnimeList: FC = () => {

  const {getAnimeList} = animeStore
  const {isAdmin} = authStore

  const [isCreateAnimeOpen, setIsCreateAnimeOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);

  const toggleCreateAnime = () => {
    setIsCreateAnimeOpen((prev) => !prev)
  }

  const toggleCreateTag = () => {
    setIsCreateTagOpen((prev) => !prev)
  }

  const actions: IAction[] = [
    {
      onClick: toggleCreateAnime,
      name: 'Добавить аниме',
      icon: <HdrAutoIcon />,
    },
    {
      onClick: toggleCreateTag,
      name: 'Добавить тег',
      icon: <NoteAddIcon />,
    },
  ];

  useEffect(() => {
    getAnimeList()
  }, [])

  return ( 
    <>
      <div>anime list</div>

      {isAdmin && ( 
        <SpeedDial
          ariaLabel="SpeedDial basic example"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              onClick={action.onClick}
              slotProps={{
                tooltip: {
                  title: action.name,
                },
              }}
            />
          ))}

        </SpeedDial>
      )}

      <CreateAnimeModal open={isCreateAnimeOpen} onClose={toggleCreateAnime}/>
      <CreateTagModal open={isCreateTagOpen} onClose={toggleCreateTag}/>
    </>
  );
}
 
export default observer(AnimeList);