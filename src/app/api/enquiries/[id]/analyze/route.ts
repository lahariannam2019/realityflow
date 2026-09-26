import { NextRequest, NextResponse } from 'next/server';
import { triggerLeadAnalysis } from '@/lib/ai/pipeline';
import { fetchLeadAnalysisByEnquiryId } from '@/lib/db/repository';

// In-memory rate limiting map for re-analysis: enquiryId -> lastTimestamp (ms)
const reanalyzeCooldowns = new Map<string, number>();
const COOLDOWN_SECONDS = 10;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Rate-limiting check per Blueprint Section 6 & 9
    const lastTrigger = reanalyzeCooldowns.get(id);
    const now = Date.now();
    if (lastTrigger && now - lastTrigger < COOLDOWN_SECONDS * 1000) {
      const waitRemaining = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - lastTrigger)) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${waitRemaining}s before re-analyzing this lead again.`,
          cooldownRemaining: waitRemaining,
        },
        { status: 429 }
      );
    }

    reanalyzeCooldowns.set(id, now);

    // Trigger AI analysis
    const analysis = await triggerLeadAnalysis(id);

    return NextResponse.json({
      success: true,
      analysis,
      message: 'AI lead analysis completed successfully.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/enquiries/[id]/analyze:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to re-analyze lead' },
      { status: 500 }
    );
  }
}
