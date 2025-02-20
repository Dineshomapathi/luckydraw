// src/app/api/participants/route.ts
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    // Get all non-excluded participants
    const participants = await prisma.participant.findMany({
      where: {
        excluded: false
      },
      orderBy: {
        id: 'asc'  // Changed from employeeId to id since it's a guaranteed field
      }
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { employeeIds } = await req.json();
    
    // Clear existing participants first
    await prisma.participant.deleteMany();
    
    // Create new participants
    const participants = await prisma.participant.createMany({
      data: employeeIds.map((employeeId: string) => ({ 
        employeeId,
        excluded: false 
      })),
      skipDuplicates: true
    });

    return NextResponse.json({ 
      success: true, 
      count: participants.count 
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Duplicate employee IDs found' }, 
          { status: 400 }
        );
      }
    }
    console.error('Error creating participants:', error);
    return NextResponse.json(
      { error: 'Failed to create participants' }, 
      { status: 500 }
    );
  }
}