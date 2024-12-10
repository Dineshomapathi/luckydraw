// src/app/round1/page.tsx
import LuckyDrawRound1 from '@/components/LuckyDrawRound1';
import { Suspense } from 'react';

export default async function Round1Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LuckyDrawRound1 />
    </Suspense>
  );
}