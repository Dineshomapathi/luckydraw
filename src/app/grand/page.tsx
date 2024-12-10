
// src/app/grand/page.tsx
import LuckyDrawGrand from '@/components/LuckyDrawGrand';
import { Suspense } from 'react';

export default function GrandPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LuckyDrawGrand />
    </Suspense>
  );
}