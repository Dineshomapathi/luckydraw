// src/app/winners/[round]/page.tsx
import WinnersList from '@/components/WinnersList';
import { Suspense } from 'react';

interface PageProps {
  params: {
    round: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function WinnersPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <WinnersList round={params.round} />
      </Suspense>
    </div>
  );
}

// To improve type safety, add this
export async function generateStaticParams() {
  return [
    { round: 'round1' },
    { round: 'round2' },
    { round: 'grand' },
    { round: 'all' },
  ];
}