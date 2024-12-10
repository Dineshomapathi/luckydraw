// src/app/api/database/clear/route.ts
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear winners table
    await prisma.winner.deleteMany();
    
    // Clear participants table
    await prisma.participant.deleteMany();

    return NextResponse.json({ 
      success: true, 
      message: 'Database cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json(
      { error: 'Failed to clear database' }, 
      { status: 500 }
    );
  }
}