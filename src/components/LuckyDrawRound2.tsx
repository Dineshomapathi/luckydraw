// src/components/LuckyDrawRound1.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { filterPreviousWinners } from '@/lib/utils/winnerUtils';

const LuckyDrawRound2 = () => {
  const [allNames, setAllNames] = useState<string[]>([]);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [slotNames, setSlotNames] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [currentSpinNumber, setCurrentSpinNumber] = useState(1);
  const [winnerCount, setWinnerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function loadParticipants() {
      try {
        // Get participants excluding Round 1 winners
        const response = await fetch('/api/participants?excludeWinners=true&round=round1');
        const data = await response.json();
        const names = data.map((p: any) => p.name);
        setAllNames(names);
        setSlotNames(getRandomNames(names, 5));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading participants:', error);
        setIsLoading(false);
      }
    }
    loadParticipants();
  }, []);

  const getRandomNames = (names: string[], count: number) => {
    const shuffled = [...names].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getOpacityStyle = (index: number) => {
    switch (index) {
      case 0: return 'opacity-30';
      case 1: return 'opacity-65';
      case 2: return 'opacity-100';
      case 3: return 'opacity-65';
      case 4: return 'opacity-30';
      default: return 'opacity-100';
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isDrawing && allNames.length > 0 && currentSpinNumber <= 3) {
        event.preventDefault();
        handleDraw();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isDrawing, allNames, currentSpinNumber]);

  const saveWinnersToDb = async (selectedNames: string[]) => {
    const winnersData = selectedNames.map((name, index) => ({
      name,
      round: 'round2',
      spinNumber: currentSpinNumber,
      orderNumber: winnerCount + index + 1
    }));

    try {
      await fetch('/api/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners: winnersData })
      });
    } catch (error) {
      console.error('Error saving winners:', error);
    }
  };

  const handleDraw = () => {
    if (isDrawing || currentSpinNumber > 3) return;
    setIsDrawing(true);
    setShowGrid(false);
    setDisplayNames([]);

    let slotCounter = 0;
    const slotDuration = 6000;
    const slotInterval = 100;
    const slotIterations = slotDuration / slotInterval;

    const slotAnimation = setInterval(() => {
      setSlotNames(prev => {
        const newNames = [...prev.slice(1), allNames[Math.floor(Math.random() * allNames.length)]];
        while (newNames.length < 5) {
          newNames.push(allNames[Math.floor(Math.random() * allNames.length)]);
        }
        return newNames;
      });

      slotCounter++;
      if (slotCounter >= slotIterations) {
        clearInterval(slotAnimation);
        setShowGrid(true);

        // Get winners for this spin
        const numWinners = currentSpinNumber === 3 ? 19 : 18;
        const availableNames = filterPreviousWinners(allNames, winners);
        const selectedNames = getRandomNames(availableNames, numWinners);

        // Immediately set all displayNames
        setDisplayNames(selectedNames);

        // Update state and DB
        setCurrentSpinNumber(prev => prev + 1);
        setIsDrawing(false);
        saveWinnersToDb(selectedNames);
        setWinners(prev => [...prev, ...selectedNames]);
        setWinnerCount(prev => prev + selectedNames.length);

        // Show confetti for a short period
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, slotInterval);
  };

  // Confetti component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 150 }).map((_, i) => {
        const size = Math.random() * 10 + 5;
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        return (
          <div
            key={i}
            className="absolute animate-confetti-fall"
            style={{
              left: `${Math.random() * 100}vw`,
              top: '-20px',
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              borderRadius: '50%',
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${Math.random() * 1.5}s`
            }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="relative h-screen w-screen">
      {showConfetti && <Confetti />}
      <div 
        className="relative h-full w-full flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/r2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {isLoading ? (
          <div className="text-white text-2xl">Loading participants...</div>
        ) : allNames.length === 0 ? (
          <div className="text-white text-2xl">No eligible participants available.</div>
        ) : (
          <div className="w-full max-w mx-auto px-4">
            {!showGrid ? (
              <div className="relative">
                <div className="flex flex-col items-center justify-center h-[400px] overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                w-[1000px] h-[80px] border-4 border-white rounded-lg flex items-center justify-center z-10" />
                  
                  <div className={`flex flex-col items-center transition-transform duration-100 
                    ${isDrawing ? 'animate-slot-spin' : ''}`}>
                    {slotNames.map((name, index) => (
                      <div 
                        key={index}
                        className={`h-[80px] flex items-center justify-center
                          ${index === 2 ? 'text-5xl font-bold' : 'text-4xl'} 
                          ${getOpacityStyle(index)}
                          text-black transition-all duration-200`}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {displayNames.map((name, index) => (
                  name && (
                    <div 
                      key={index}
                      className="text-2xl font-semibold text-black bg-white/80 p-3 rounded text-center animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {name}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyDrawRound2;
