// src/components/WinnersList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Winner } from '@/lib/types';
import { getRoundLabel } from '@/lib/utils/winnerUtils';

interface WinnersListProps {
  round: string;
}

export const WinnersList = ({ round }: WinnersListProps) => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWinners() {
      try {
        const res = await fetch(`/api/winners?round=${round}`);
        const data = await res.json();
        setWinners(data);
      } catch (error) {
        console.error('Error loading winners:', error);
      } finally {
        setLoading(false);
      }
    }
    loadWinners();
  }, [round]);

  const downloadWinners = async () => {
    window.location.href = `/api/winners?download=true${round !== 'all' ? `&round=${round}` : ''}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading winners...</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{round === 'all' ? 'All Winners' : `Winners - ${getRoundLabel(round)}`}</h2>
        <button 
          onClick={downloadWinners}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Download Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {winners.map((winner) => (
          <div 
            key={`${winner.round}-${winner.orderNumber}`}
            className="p-4 bg-white rounded-lg shadow"
          >
            <div className="text-lg font-semibold">#{winner.orderNumber} {winner.name}</div>
            <div className="text-sm text-gray-600">
              {getRoundLabel(winner.round)} - Spin #{winner.spinNumber}
            </div>
          </div>
        ))}
      </div>

      {winners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No winners found for this round yet.
        </div>
      )}
    </div>
  );
};

export default WinnersList;