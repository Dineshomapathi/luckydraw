// src/app/api/winners/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { Winner } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Use transaction to update both winners and participants
    await prisma.$transaction(async (tx) => {
      // Add winners
      await tx.winner.createMany({
        data: data.winners
      });

      // Update participant status to excluded
      const winnerIds = data.winners.map((w: any) => w.employeeId);
      await tx.participant.updateMany({
        where: {
          employeeId: {
            in: winnerIds
          }
        },
        data: {
          excluded: true
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving winners:', error);
    return NextResponse.json({ error: 'Failed to save winners' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const round = searchParams.get('round');
    const download = searchParams.get('download');
    const rounds = searchParams.get('rounds')?.split(',');

    let winners;
    if (rounds) {
      winners = await prisma.winner.findMany({
        where: { round: { in: rounds } },
        orderBy: [
          { round: 'asc' },
          { drawNumber: 'asc' }
        ]
      });
    } else if (round && round !== 'all') {
      winners = await prisma.winner.findMany({
        where: { round },
        orderBy: { drawNumber: 'asc' }
      });
    } else {
      winners = await prisma.winner.findMany({
        orderBy: [
          { round: 'asc' },
          { drawNumber: 'asc' }
        ]
      });
    }

    if (download === 'true') {
      const formattedWinners = winners.map(w => ({
        'Lucky Draw': w.round,
        'Draw Number': w.drawNumber,
        'Employee ID': w.employeeId,
        'Draw Time': new Date(w.timestamp).toLocaleString()
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(formattedWinners);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Lucky Draw
        { wch: 12 }, // Draw Number
        { wch: 15 }, // Employee ID
        { wch: 20 }  // Draw Time
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Winners');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      return new Response(buffer, {
        headers: {
          'Content-Disposition': 'attachment; filename=lucky_draw_winners.xlsx',
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
    }

    return NextResponse.json(winners);
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 });
  }
}