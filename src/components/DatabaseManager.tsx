// src/components/DatabaseManager.tsx
'use client';

import React, { useState } from 'react';

export default function DatabaseManager() {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState('');

  const clearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    setMessage('Clearing database...');

    try {
      const response = await fetch('/api/database/clear', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage('Database cleared successfully!');
      } else {
        throw new Error('Failed to clear database');
      }
    } catch (error) {
      setMessage('Error clearing database: ' + (error as Error).message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-red-600">Database Management</h2>
      <button
        onClick={clearDatabase}
        disabled={isClearing}
        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
      >
        {isClearing ? 'Clearing...' : 'Clear All Data'}
      </button>
      {message && (
        <p className={`mt-4 text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}