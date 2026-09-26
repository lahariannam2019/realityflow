import { NextRequest, NextResponse } from 'next/server';
import { resetToCleanProductionState } from '@/lib/db/repository';

export async function POST(request: NextRequest) {
  try {
    const result = await resetToCleanProductionState();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
