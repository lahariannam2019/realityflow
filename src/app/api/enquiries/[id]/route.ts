import { NextRequest, NextResponse } from 'next/server';
import {
  fetchEnquiryById,
  updateCRMLeadStatus,
  assignLead,
  setFollowUpDate,
} from '@/lib/db/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enquiry = await fetchEnquiryById(id);

    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedStatuses = [
      // Phase 3 CRM Stages
      'NEW',
      'CONTACTED',
      'QUALIFIED',
      'SITE_VISIT_SCHEDULED',
      'SITE_VISIT_COMPLETED',
      'NEGOTIATION',
      'WON',
      'LOST',
      // Legacy backward compatibility
      'new',
      'contacted',
      'qualified',
      'not_interested',
      'closed',
    ];

    let currentEnquiry = await fetchEnquiryById(id);
    if (!currentEnquiry) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    // 1. Update Status & Lost Reason / Deal Value
    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid lead status "${body.status}".` },
          { status: 400 }
        );
      }
      currentEnquiry = await updateCRMLeadStatus(id, body.status, {
        lost_reason: body.lost_reason,
        deal_value: body.deal_value !== undefined ? Number(body.deal_value) : undefined,
        staffId: body.staff_id,
      });
    }

    // 2. Update Assignment
    if (body.assigned_to !== undefined) {
      currentEnquiry = await assignLead(id, body.assigned_to, body.actor_staff_id);
    }

    // 3. Update Follow-up Schedule
    if (body.next_follow_up_at !== undefined) {
      currentEnquiry = await setFollowUpDate(id, body.next_follow_up_at, {
        staffId: body.actor_staff_id,
        notes: body.follow_up_note,
      });
    }

    // Fetch refreshed complete enquiry with activities and visits
    const refreshed = await fetchEnquiryById(id);

    return NextResponse.json({ success: true, enquiry: refreshed });
  } catch (error: any) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
