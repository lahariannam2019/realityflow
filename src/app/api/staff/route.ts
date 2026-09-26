import { NextRequest, NextResponse } from 'next/server';
import { fetchStaffProfiles } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const staff = await fetchStaffProfiles();
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
