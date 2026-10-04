export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createNewEnquiry, fetchEnquiries, fetchPropertyById } from '@/lib/db/repository';
import { triggerLeadAnalysis } from '@/lib/ai/pipeline';
import { LeadFilterParams } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: LeadFilterParams = {
      status: (searchParams.get('status') as any) || undefined,
      priority: (searchParams.get('priority') as any) || undefined,
      search: searchParams.get('search') || undefined,
      propertyId: searchParams.get('propertyId') || undefined,
      assignedTo: (searchParams.get('assignedTo') as any) || undefined,
      followUpDue: (searchParams.get('followUpDue') as any) || undefined,
    };

    const enquiries = await fetchEnquiries(filters);
    console.log(`[DIAGNOSTIC - GET /api/enquiries] Filters: ${JSON.stringify(filters)} | Count returned: ${enquiries.length}`);
    return NextResponse.json({ success: true, enquiries });
  } catch (error: any) {
    console.error('API Error in GET /api/enquiries:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Anti-spam honeypot check
    if (body._hp_check) {
      // Spam bot filled hidden field, return success without saving
      return NextResponse.json({ success: true, message: 'Enquiry received' }, { status: 200 });
    }

    // 2. Validate required fields
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid full name.' },
        { status: 400 }
      );
    }

    // Phone validation: E.164 standard international or 10-digit Indian
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number (10 to 15 digits).' },
        { status: 400 }
      );
    }

    // Email validation: strict existing format
    const email = typeof body.email === 'string' ? body.email.trim() : null;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please include your requirements or question in the message.' },
        { status: 400 }
      );
    }

    const propertyId = body.property_id || null;
    
    if (propertyId) {
      const property = await fetchPropertyById(propertyId);
      if (!property) {
        return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
      }
      if (property.status === 'sold' || property.status === 'inactive' || property.availability === 'sold' || property.is_published === false) {
        return NextResponse.json(
          { success: false, error: 'This property is no longer available for new enquiries.' }, 
          { status: 400 }
        );
      }
    }

    const statedBudget = body.stated_budget ? String(body.stated_budget).trim() : null;
    const statedLocation = body.stated_location ? String(body.stated_location).trim() : null;
    const source = body.source || (propertyId ? 'property_page' : 'contact_form');

    // 3. Persist enquiry to Supabase / repository
    const enquiry = await createNewEnquiry({
      property_id: propertyId,
      name,
      phone,
      email,
      message,
      stated_budget: statedBudget,
      stated_location: statedLocation,
      source,
    });

    // 4. Asynchronously trigger Phase 2 AI Lead Analysis (Non-blocking)
    // Customer sees confirmation immediately; analysis completes in background
    const syncParam = new URL(request.url).searchParams.get('sync');
    if (syncParam === 'true') {
      // Synchronous wait for automated tests if requested
      await triggerLeadAnalysis(enquiry.id);
    } else {
      // Non-blocking trigger in background
      triggerLeadAnalysis(enquiry.id).catch((err) =>
        console.error(`[RealityFlow AI] Async background analysis error for ${enquiry.id}:`, err)
      );
    }

    return NextResponse.json({
      success: true,
      enquiryId: enquiry.id,
      message: 'Thank you for your enquiry. Our luxury property advisor will contact you shortly.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('API Error in POST /api/enquiries:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
