export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export interface Card {
  id: string;
  content: string;
  category: Season;
  userId: string;
  userName: string;
  userNickname?: string;
  createdAt: Date;
  attachment?: {
    url: string;
    name: string;
    type: string;
  };
}

export interface UserProfile {
  id: string;
  nickname?: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export const seasonLabels: Record<Season, string> = {
  winter: 'Hiver',
  spring: 'Printemps',
  summer: 'Été',
  autumn: 'Automne'
};
