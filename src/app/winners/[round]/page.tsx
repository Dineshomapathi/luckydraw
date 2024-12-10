// src/app/winners/[round]/page.tsx
import WinnersList from '@/components/WinnersList';

export default function WinnersPage({ params }: { params: { round: string } }) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <WinnersList round={params.round} />
    </div>
  );
}