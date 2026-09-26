import { NextRequest, NextResponse } from 'next/server';
import { logContactAction, fetchEnquiryById } from '@/lib/db/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const actionType = body.action_type; // 'call_logged' | 'whatsapp_sent' | 'email_sent'
    if (!['call_logged', 'whatsapp_sent', 'email_sent'].includes(actionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contact action type.' },
        { status: 400 }
      );
    }

    const title = body.title || (
      actionType === 'call_logged' ? 'Phone call logged' :
      actionType === 'whatsapp_sent' ? 'WhatsApp message initiated' :
      'Email sent'
    );

    const updated = await logContactAction(id, actionType, {
      title,
      description: body.notes || body.description,
      outcome: body.outcome,
      staffId: body.staff_id,
      metadata: body.metadata,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const refreshed = await fetchEnquiryById(id);
    return NextResponse.json({ success: true, enquiry: refreshed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
