/**
 * Plan Retrieval Endpoint
 *
 * Fetches a previously generated plan by ID.
 */

import { NextResponse } from 'next/server';
import { getPlan } from '@/lib/plan-generator';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Plan ID required' },
      { status: 400 }
    );
  }

  const result = getPlan(id);

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Plan not found' },
      { status: 404 }
    );
  }

  // Strip email from intake for privacy
  const { email, ...safeIntake } = result.intake;

  return NextResponse.json({
    success: true,
    plan: result.plan,
    intake: safeIntake,
  });
}
