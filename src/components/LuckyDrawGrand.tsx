"use client";

import React, { useState, useEffect } from 'react';
import { filterPreviousWinners } from '@/lib/utils/winnerUtils';
import { Winner } from '@/lib/types';

const LuckyDrawGrand = () => {
  const [allNames, setAllNames] = useState<string[]>([]);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [currentSpinNumber, setCurrentSpinNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadParticipants() {
      try {
        // Get participants excluding Round 1 and Round 2 winners
        const response = await fetch('/api/participants?excludeWinners=true&rounds=round1,round2');
        const data = await response.json();
        const names = data.map((p: any) => p.name);
        setAllNames(names);
        setDisplayNames(getRandomNames(names, 5));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading participants:', error);
        setIsLoading(false);
      }
    }
    loadParticipants();
  }, []);

  // Confetti component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 150 }).map((_, i) => {
        const size = Math.random() * 10 + 5;
        return (
          <div
            key={i}
            className="absolute animate-confetti-fall"
            style={{
              left: `${Math.random() * 100}vw`,
              top: '-20px',
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'][
                Math.floor(Math.random() * 6)
              ],
              borderRadius: '50%',
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${Math.random() * 1.5}s`
            }}
          />
        );
      })}
    </div>
  );

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
      if (event.code === 'Space' && !isDrawing && allNames.length > 0) {
        event.preventDefault();
        handleDraw();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isDrawing, allNames]);

  const saveWinnerToDb = async (winner: string) => {
    const winnerData = [{
      name: winner,
      round: 'grand',
      spinNumber: currentSpinNumber,
      orderNumber: winners.length + 1
    }];

    try {
      await fetch('/api/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners: winnerData })
      });
    } catch (error) {
      console.error('Error saving winner:', error);
    }
  };

  const handleDraw = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setShowConfetti(false);
    
    let counter = 0;
    const animationDuration = 6000;
    const interval = 100;
    const iterations = animationDuration / interval;
    
    const drawInterval = setInterval(() => {
      setDisplayNames(prev => {
        const newNames = [...prev.slice(1), allNames[Math.floor(Math.random() * allNames.length)]];
        while (newNames.length < 5) {
          newNames.push(allNames[Math.floor(Math.random() * allNames.length)]);
        }
        return newNames;
      });
      
      counter++;
      if (counter >= iterations) {
        clearInterval(drawInterval);
        
        // Get single winner
        const availableNames = filterPreviousWinners(allNames, winners);
        const winner = availableNames[Math.floor(Math.random() * availableNames.length)];
        
        // Set final display with winner in center
        const finalNames = [
          ...getRandomNames(availableNames, 2),
          winner,
          ...getRandomNames(availableNames, 2)
        ];
        setDisplayNames(finalNames);
        setWinners(prev => [...prev, winner]);
        saveWinnerToDb(winner);
        setCurrentSpinNumber(prev => prev + 1);
        setIsDrawing(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, interval);
  };

  return (
    <div className="relative h-screen w-screen">
      {showConfetti && <Confetti />}
      <div 
        className="relative h-full w-full flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/gld.png')",
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
          <div className="relative">
            <div className="flex flex-col items-center justify-center h-[400px] overflow-hidden">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                             w-[1000px] h-[80px] border-4 border-white rounded-lg flex items-center justify-center z-10" />
              
              <div className={`flex flex-col items-center transition-transform duration-100 
                ${isDrawing ? 'animate-slot-spin' : ''}`}>
                {displayNames.map((name, index) => (
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
        )}
      </div>
    </div>
  );
};

export default LuckyDrawGrand;