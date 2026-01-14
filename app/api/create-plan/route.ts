/**
 * Create Plan Endpoint
 *
 * Generates a personalized 7-day breathwork plan based on intake.
 * Optionally includes MedGemma education if symptom_description provided.
 */

import { NextResponse } from 'next/server';
import { IntakeSchema } from '@/lib/schemas';
import { generatePlan, storePlan } from '@/lib/plan-generator';
import { getSymptomEducation } from '@/lib/medgemma';

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

    // If symptom description provided, get MedGemma education
    let education = undefined;
    if (intake.symptom_description && intake.symptom_description.length > 10) {
      try {
        education = await getSymptomEducation({
          symptomDescription: intake.symptom_description,
        });
      } catch (error) {
        console.warn('MedGemma education failed, continuing without:', error);
        // Continue without education - non-blocking
      }
    }

    // Generate plan (instant, <10ms)
    const plan = generatePlan(intake, education);

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
