export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createSiteVisit, fetchSiteVisits } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enquiry_id = searchParams.get('enquiry_id') || undefined;
    const staff_id = searchParams.get('staff_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const date = searchParams.get('date') || undefined;

    const visits = await fetchSiteVisits({ enquiry_id, staff_id, status, date });
    return NextResponse.json({ success: true, visits });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.enquiry_id || !body.property_id || !body.scheduled_at) {
      return NextResponse.json(
        { success: false, error: 'Enquiry ID, property ID, and scheduled date/time are required.' },
        { status: 400 }
      );
    }

    const visit = await createSiteVisit({
      enquiry_id: body.enquiry_id,
      property_id: body.property_id,
      scheduled_at: body.scheduled_at,
      assigned_staff_id: body.assigned_staff_id || null,
      visitor_notes: body.visitor_notes || null,
      status: body.status || 'SCHEDULED',
    });

    return NextResponse.json({ success: true, visit }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating site visit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
