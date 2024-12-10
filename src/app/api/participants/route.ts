// src/app/api/participants/route.ts
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // Get all non-excluded participants
    const participants = await prisma.participant.findMany({
      where: {
        excluded: false
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { names } = await req.json();
    
    // Create participants with excluded set to false by default
    const participants = await prisma.participant.createMany({
      data: names.map((name: string) => ({ 
        name,
        excluded: false 
      }))
    });

    return NextResponse.json({ success: true, count: participants.count });
  } catch (error) {
    console.error('Error creating participants:', error);
    return NextResponse.json({ error: 'Failed to create participants' }, { status: 500 });
  }
}