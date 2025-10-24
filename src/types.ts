export enum AssetType {
  Logo = 'Logo',
  Banner = 'Banner',
  Thumbnail = 'Thumbnail',
  Description = 'Description',
  Intro = 'Intro',
  About = 'About',
}

export interface AssetSize {
  width: number;
  height: number;
  aspectRatio: '1:1' | '16:9';
}

export interface HistoryItem {
  id: string;
  type: AssetType;
  imageUrl?: string;
  prompt: string;
  createdAt: string;
}