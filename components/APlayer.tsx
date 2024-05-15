import React, { useEffect } from 'react';
import ReactAplayer from 'react-aplayer';

interface SongInfo {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc: string;
}

export default function APlayer({ songInfo }: SongInfo) {
  
  useEffect(() => {
    // 在组件挂载后执行的逻辑
  }, []);

  const playerProps = {
    theme: '#F57F17',
    lrcType: 3,
    autoplay: true,
    audio: [
      {
        name: songInfo.name,
        artist: songInfo.artist,
        url: songInfo.url,
        cover: songInfo.cover,
        lrc: songInfo.lrc,
      },
    ],
  };

  return (
    <div>
      <ReactAplayer {...playerProps} />
    </div>
  );
}