import { Timestamp } from 'firebase/firestore';

export type Season = 'summer' | 'autumn' | 'winter' | 'spring';

export interface Card {
  id: string;
  content: string;
  userName: string;
  userNickname?: string;
  userId: string;
  createdAt: Timestamp;
  season: Season;
  imageUrl?: string;
  attachment?: {
    url: string;
    type: string;
    name: string;
  } | null;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  nickname?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

export const seasonLabels: Record<Season, string> = {
  summer: 'Été',
  autumn: 'Automne',
  winter: 'Hiver',
  spring: 'Printemps'
};

export const seasonColors: Record<Season, string> = {
  summer: '#FFB74D',
  autumn: '#FF7043',
  winter: '#4FC3F7',
  spring: '#81C784'
};
