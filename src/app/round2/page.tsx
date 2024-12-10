// src/app/round2/page.tsx
import LuckyDrawRound2 from '@/components/LuckyDrawRound2';
import { Suspense } from 'react';

export default async function Round2Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LuckyDrawRound2 />
    </Suspense>
  );
}