// src/components/LuckyDrawRound1.tsx
"use client";

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { filterPreviousWinners, getPreviousWinners } from '@/lib/utils/winnerUtils';
import { Winner } from '@/lib/types';

const LuckyDrawRound1 = () => {
  const [allNames, setAllNames] = useState<string[]>([]);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [slotNames, setSlotNames] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [currentSpinNumber, setCurrentSpinNumber] = useState(1);
  const [winnerCount, setWinnerCount] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      const names = jsonData.slice(1).map((row: any) => row[0]).filter(Boolean);
      setAllNames(names);
      setSlotNames(getRandomNames(names, 5));
    };

    reader.readAsArrayBuffer(file);
  };

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
      round: 'round1',
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

        let counter = 0;
        const drawInterval = setInterval(() => {
          if (counter >= selectedNames.length) {
            clearInterval(drawInterval);
            setCurrentSpinNumber(prev => prev + 1);
            setIsDrawing(false);
            saveWinnersToDb(selectedNames);
            setWinners(prev => [...prev, ...selectedNames]);
            setWinnerCount(prev => prev + selectedNames.length);
          } else {
            setDisplayNames(prev => [...prev, selectedNames[counter]]);
            counter++;
          }
        }, 100);
      }
    }, slotInterval);
  };

  return (
    <div className="relative h-screen w-screen">
      <div 
        className="relative h-full w-full flex flex-col items-center justify-center"
        style={{
          backgroundImage: "url('/r1.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {allNames.length === 0 ? (
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="absolute top-4 left-4 text-white"
          />
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
                {displayNames.map((name, index) => 
                  name && (
                    <div 
                      key={index}
                      className="text-2xl font-semibold text-black bg-white/80 p-3 rounded text-center animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {name}
                    </div>
                  )
                )}
              </div>
            )}

            <div className="absolute top-4 right-4 text-white text-lg">
              Spin {currentSpinNumber}/3
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyDrawRound1;