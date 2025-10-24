import { AssetSize } from './types';

export const YOUTUBE_LOGO_SIZE: AssetSize = {
  width: 800,
  height: 800,
  aspectRatio: '1:1',
};

// While banners are 2560x1440, a 16:9 aspect ratio is standard for generation.
export const YOUTUBE_BANNER_SIZE: AssetSize = {
  width: 2560,
  height: 1440,
  aspectRatio: '16:9',
};

export const YOUTUBE_THUMBNAIL_SIZE: AssetSize = {
  width: 1280,
  height: 720,
  aspectRatio: '16:9',
};