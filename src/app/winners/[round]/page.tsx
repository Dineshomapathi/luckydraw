import { GetServerSidePropsContext } from 'next';
import WinnersList from '@/components/WinnersList';
import { Suspense } from 'react';

type Params = {
  round: string;
};

function WinnersPage({ params }: { params: Params }) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <WinnersList round={params.round} />
      </Suspense>
    </div>
  );
}

export default WinnersPage;
