"use client";

import React, { useState, useEffect } from 'react';
import { filterPreviousWinners } from '@/lib/utils/winnerUtils';
import { Winner } from '@/lib/types';

const LuckyDrawGrand = () => {
  const [allIds, setAllIds] = useState<string[]>([]);
  const [displayIds, setDisplayIds] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [currentSpinNumber, setCurrentSpinNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadParticipants() {
      try {
        // Get participants excluding previous winners
        const response = await fetch('/api/participants');
        const data = await response.json();
        const ids = data.map((p: any) => p.employeeId);
        setAllIds(ids);
        setDisplayIds(getRandomIds(ids, 5));
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

  const getRandomIds = (ids: string[], count: number) => {
    const shuffled = [...ids].sort(() => 0.5 - Math.random());
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
      if (event.code === 'Space' && !isDrawing && allIds.length > 0 && currentSpinNumber <= 10) {
        event.preventDefault();
        handleDraw();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isDrawing, allIds, currentSpinNumber]);

  const saveWinnerToDb = async (employeeId: string) => {
    const winnerData = [{
      employeeId: employeeId,
      round: 'draw1',
      drawNumber: currentSpinNumber
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
    if (isDrawing || currentSpinNumber > 10) return;
    setIsDrawing(true);
    setShowConfetti(false);
    
    let counter = 0;
    const animationDuration = 6000;
    const interval = 100;
    const iterations = animationDuration / interval;
    
    const drawInterval = setInterval(() => {
      setDisplayIds(prev => {
        const newIds = [...prev.slice(1), allIds[Math.floor(Math.random() * allIds.length)]];
        while (newIds.length < 5) {
          newIds.push(allIds[Math.floor(Math.random() * allIds.length)]);
        }
        return newIds;
      });
      
      counter++;
      if (counter >= iterations) {
        clearInterval(drawInterval);
        
        // Get single winner
        const availableIds = filterPreviousWinners(allIds, winners);
        const winner = availableIds[Math.floor(Math.random() * availableIds.length)];
        
        // Set final display with winner in center
        const finalIds = [
          ...getRandomIds(availableIds, 2),
          winner,
          ...getRandomIds(availableIds, 2)
        ];
        setDisplayIds(finalIds);
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
          backgroundImage: "url('/lr1.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {isLoading ? (
          <div className="text-white text-2xl">Loading participants...</div>
        ) : allIds.length === 0 ? (
          <div className="text-white text-2xl">No eligible participants available.</div>
        ) : (
          <div className="relative">
            {/* <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Lucky Draw</h1>
              <div className="text-2xl text-black">Draw {currentSpinNumber}/10</div>
            </div> */}
            
            <div className="flex flex-col items-center justify-center h-[400px] overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                w-[900px] h-[80px] border-4 border-white rounded-lg flex items-center justify-center z-10 ml-[-10px]" />

              
              <div className={`flex flex-col items-center transition-transform duration-100 
                ${isDrawing ? 'animate-slot-spin' : ''}`}>
                {displayIds.map((id, index) => (
                  <div 
                    key={index}
                    className={`h-[80px] flex items-center justify-center
                      ${index === 2 ? 'text-7xl font-bold' : 'text-6xl'} 
                      ${getOpacityStyle(index)}
                      text-[#001F3F] transition-all duration-200`}
                  >
                    {id}
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