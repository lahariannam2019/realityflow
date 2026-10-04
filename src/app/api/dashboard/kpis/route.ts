export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchDashboardKPIs } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staff_id') || undefined;

    const kpis = await fetchDashboardKPIs(staffId);
    return NextResponse.json({ success: true, kpis });
  } catch (error: any) {
    console.error('Error in GET /api/dashboard/kpis:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
