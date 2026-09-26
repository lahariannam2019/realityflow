import { NextRequest, NextResponse } from 'next/server';
import { fetchNotifications, createNotification } from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staff_id') || undefined;

    const notifications = await fetchNotifications(staffId);
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Type, title, and message are required.' },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      type: body.type,
      title: body.title,
      message: body.message,
      staff_id: body.staff_id || null,
      link_url: body.link_url || null,
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
