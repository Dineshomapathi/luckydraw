// src/app/api/winners/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { Winner } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await prisma.winner.createMany({
      data: data.winners
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
        orderBy: [{ round: 'asc' }, { orderNumber: 'asc' }]
      });
    } else if (round && round !== 'all') {
      winners = await prisma.winner.findMany({
        where: { round },
        orderBy: { orderNumber: 'asc' }
      });
    } else {
      winners = await prisma.winner.findMany({
        orderBy: [{ round: 'asc' }, { orderNumber: 'asc' }]
      });
    }

    if (download === 'true') {
      const formattedWinners = winners.map(w => ({
        Round: w.round === 'grand' ? 'Grand Draw' : `Round ${w.round.slice(-1)}`,
        'Spin Number': w.spinNumber,
        'Winner Number': w.orderNumber,
        Name: w.name,
        'Draw Time': new Date(w.timestamp).toLocaleString()
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(formattedWinners);
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