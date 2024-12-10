// src/app/page.tsx
import Link from 'next/link';
import ExcelUpload from '@/components/ExcelUpload';
import DatabaseManager from '@/components/DatabaseManager';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Lucky Draw System</h1>
        
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ExcelUpload />
          <DatabaseManager />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/round1">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-semibold mb-2">Round 1</h2>
              <p className="text-gray-300">First round with 55 winners</p>
            </div>
          </Link>
          
          <Link href="/round2">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-semibold mb-2">Round 2</h2>
              <p className="text-gray-300">Second round with 55 winners</p>
            </div>
          </Link>
          
          <Link href="/grand">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-semibold mb-2">Grand Draw</h2>
              <p className="text-gray-300">Final round with 10 winners</p>
            </div>
          </Link>
          
          <Link href="/winners/all">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors">
              <h2 className="text-2xl font-semibold mb-2">View Winners</h2>
              <p className="text-gray-300">See all winners and download results</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}