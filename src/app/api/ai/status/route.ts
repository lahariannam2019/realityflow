export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyGeminiConnection } from '@/lib/ai/engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const status = await verifyGeminiConnection(forceRefresh);

    return NextResponse.json({
      success: true,
      diagnostics: status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        diagnostics: {
          provider: 'deterministic-fallback',
          geminiConfigured: false,
          liveGeminiVerified: false,
          status: 'error',
          message: 'Live Gemini integration not verified; deterministic fallback is being used.',
          model: 'rule-based-nlp-v2',
          analysisVersion: 'phase2-v1',
          lastCheckedAt: new Date().toISOString(),
          lastError: error.message,
        },
      },
      { status: 500 }
    );
  }
}
