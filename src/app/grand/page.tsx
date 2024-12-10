// src/app/grand/page.tsx
import LuckyDrawGrand from '@/components/LuckyDrawGrand';
import { Suspense } from 'react';

export default async function GrandPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LuckyDrawGrand />
    </Suspense>
  );
}