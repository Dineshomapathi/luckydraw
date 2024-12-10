// src/lib/utils/winnerUtils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Winner } from "../types"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function filterPreviousWinners(allNames: string[], previousWinners: string[]) {
  return allNames.filter(name => !previousWinners.includes(name));
}

export async function getPreviousWinners(rounds?: string[]): Promise<string[]> {
  const queryParams = rounds ? `?rounds=${rounds.join(',')}` : '';
  const res = await fetch(`/api/winners${queryParams}`);
  const winners = await res.json();
  return winners.map((w: Winner) => w.name);
}

export function formatWinnerNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

export function getRoundLabel(round: string): string {
  switch (round) {
    case 'round1':
      return 'Round 1';
    case 'round2':
      return 'Round 2';
    case 'grand':
      return 'Grand Draw';
    default:
      return round;
  }
}