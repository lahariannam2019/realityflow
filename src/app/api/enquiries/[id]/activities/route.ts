export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchLeadActivities, addLeadActivity } from '@/lib/db/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activities = await fetchLeadActivities(id);
    return NextResponse.json({ success: true, activities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const title = body.title ? String(body.title).trim() : 'Note added';
    const description = body.description ? String(body.description).trim() : '';
    const activityType = body.activity_type || 'note_added';

    if (!description && !body.title) {
      return NextResponse.json(
        { success: false, error: 'Note content is required.' },
        { status: 400 }
      );
    }

    const activity = await addLeadActivity({
      enquiry_id: id,
      staff_id: body.staff_id || null,
      activity_type: activityType,
      title,
      description,
      metadata: body.metadata || {},
    });

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
