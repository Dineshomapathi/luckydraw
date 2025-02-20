// src/lib/types.ts
export interface Winner {
  id?: number;
  employeeId: string;
  round: string; // 'draw1', 'draw2', 'draw3', 'draw4'
  drawNumber: number;
  timestamp?: Date;
}

export type Round = 'draw1' | 'draw2' | 'draw3' | 'draw4';