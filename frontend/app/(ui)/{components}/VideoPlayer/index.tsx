'use client';

import { forwardRef } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = forwardRef<any, React.ComponentProps<typeof ReactPlayer>>((props, ref) => {
  return <ReactPlayer ref={ref} {...props} />;
});

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;