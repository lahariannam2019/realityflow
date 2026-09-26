import { NextRequest, NextResponse } from 'next/server';
import { updateSiteVisit } from '@/lib/db/repository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateSiteVisit(id, body, body.actor_staff_id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Site visit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, visit: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
