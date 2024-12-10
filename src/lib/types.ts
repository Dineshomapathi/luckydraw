// src/lib/types.ts
export interface Winner {
    id?: number;
    name: string;
    round: string; // 'round1', 'round2', 'grand'
    spinNumber: number;
    orderNumber: number;
    timestamp?: Date;
  }
  
  export type Round = 'round1' | 'round2' | 'grand';