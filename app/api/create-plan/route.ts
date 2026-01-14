/**
 * Create Plan Endpoint
 *
 * Generates a personalized 7-day breathwork plan based on intake.
 * Optionally includes MedGemma education if symptom_description provided.
 */

import { NextResponse } from 'next/server';
import { IntakeSchema } from '@/lib/schemas';
import { generatePlan, storePlan } from '@/lib/plan-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate intake
    const parseResult = IntakeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid intake data',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const intake = parseResult.data;

    // Generate plan (instant, <10ms)
    // Note: MedGemma education is now handled by /api/educate endpoint
    const plan = generatePlan(intake);

    // Store plan for retrieval
    storePlan(plan, intake);

    return NextResponse.json({
      success: true,
      plan_id: plan.id,
      plan,
    });
  } catch (error) {
    console.error('Plan creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create plan',
      },
      { status: 500 }
    );
  }
}
