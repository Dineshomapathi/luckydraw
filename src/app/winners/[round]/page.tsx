// src/app/winners/[round]/page.tsx
import WinnersList from '@/components/WinnersList';
import { Suspense } from 'react';

interface Props {
  params: {
    round: string;
  };
}

async function WinnersPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <WinnersList round={params.round} />
      </Suspense>
    </div>
  );
}

export default WinnersPage;