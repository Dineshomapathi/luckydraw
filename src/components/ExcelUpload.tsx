'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

export default function ExcelUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setMessage('Processing file...');

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to array of arrays and handle types properly
        const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(firstSheet, { 
          header: 1,
          defval: '' // Default value for empty cells
        });

        // Check if we have data and a header row
        if (!jsonData || jsonData.length === 0 || !jsonData[0]) {
          throw new Error('No data found in the Excel file');
        }

        // Check header
        const headerRow = jsonData[0];
        if (!headerRow[0] || typeof headerRow[0] !== 'string' || 
            !headerRow[0].toLowerCase().includes('employee id')) {
          throw new Error('First column must be labeled "Employee ID"');
        }

        // Extract employee IDs from the data
        const employeeIds = jsonData
          .slice(1) // Skip header row
          .map(row => row[0]?.toString().trim()) // Get first column and convert to string
          .filter(id => id && id.length > 0); // Remove empty values

        if (employeeIds.length === 0) {
          throw new Error('No employee IDs found in file');
        }

        // Upload to database
        const response = await fetch('/api/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ employeeIds }),
        });

        if (response.ok) {
          const result = await response.json();
          setMessage(`Successfully uploaded ${employeeIds.length} employee IDs`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload employee IDs');
        }
      } catch (error) {
        setMessage('Error uploading file: ' + (error as Error).message);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Employee List</h2>
      <div className="mb-4 text-sm text-gray-600">
        Please upload an Excel file with "Employee ID" in the first column.
      </div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                  file:rounded-full file:border-0 file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {message && (
        <p className={`mt-4 text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}