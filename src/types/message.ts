export interface Message {
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

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';
