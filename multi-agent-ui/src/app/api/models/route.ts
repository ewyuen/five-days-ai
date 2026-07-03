import { NextResponse } from 'next/server';
import { MODELS } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasGoogle = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const modelsWithAvailability = MODELS.map((model) => {
      let isAvailable = false;
      if (model.provider === 'openai') {
        isAvailable = hasOpenAI;
      } else if (model.provider === 'anthropic') {
        isAvailable = hasAnthropic;
      } else if (model.provider === 'google') {
        isAvailable = hasGoogle;
      }
      return {
        ...model,
        isAvailable,
      };
    });

    console.log('[API/models] Models availability status checked.');
    return NextResponse.json({ models: modelsWithAvailability });
  } catch (error) {
    console.error('[API/models] Error checking model availability:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve models' },
      { status: 500 }
    );
  }
}
