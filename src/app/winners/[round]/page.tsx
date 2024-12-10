import WinnersList from '@/components/WinnersList';
import { Suspense } from 'react';

interface Params {
  round: string;
}

interface Props {
  params: Params;
}

async function WinnersPage({ params }: Props) {
  // Ensure `params` is treated as an object and not a Promise
  const { round } = params;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <WinnersList round={round} />
      </Suspense>
    </div>
  );
}

export default WinnersPage;
