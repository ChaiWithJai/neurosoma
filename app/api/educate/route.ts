/**
 * MedGemma Health Education API
 *
 * POST /api/educate
 *
 * Takes a health question and returns:
 * - Anatomical/physiological education
 * - Research evidence for breathwork
 * - Contraindications and precautions
 * - Questions for healthcare provider
 * - Matched protocol recommendation
 *
 * HAI-DEF Attribution: Uses google/medgemma-27b-it from
 * Google's Health AI Developer Foundations collection.
 */

import { NextResponse } from 'next/server';
import { getHealthEducation, checkMedGemmaHealth } from '@/lib/medgemma';
import { matchProtocol } from '@/lib/protocol-matcher';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { healthQuestion, condition, currentTreatments } = body;

    if (!healthQuestion || typeof healthQuestion !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Health question is required' },
        { status: 400 }
      );
    }

    if (healthQuestion.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Please provide more detail (at least 20 characters)' },
        { status: 400 }
      );
    }

    // Get education from MedGemma
    const education = await getHealthEducation({
      healthQuestion,
      condition,
      currentTreatments,
    });

    // Match protocol based on contraindications analysis
    const protocol = matchProtocol(
      education.recommended_protocol_type,
      condition
    );

    return NextResponse.json({
      success: true,
      education,
      protocol,
    });
  } catch (error) {
    console.error('MedGemma education error:', error);

    const isHealthy = await checkMedGemmaHealth();

    return NextResponse.json(
      {
        success: false,
        error: isHealthy
          ? 'Failed to generate education response. Please try again.'
          : 'MedGemma service is waking up. Please try again in 30 seconds.',
        retryable: !isHealthy,
      },
      { status: isHealthy ? 500 : 503 }
    );
  }
}

export async function GET() {
  const isHealthy = await checkMedGemmaHealth();

  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'sleeping',
    model: 'google/medgemma-27b-it',
    attribution: 'Health AI Developer Foundations (HAI-DEF)',
    documentation: 'https://developers.google.com/health-ai-developer-foundations/medgemma',
  });
}
