/**
 * Deterministic Plan Generator
 *
 * Uses precached technique library to generate personalized 7-day plans
 * instantly without AI latency. The "magic" is in the matching algorithm
 * and instructional design rigor, not slow LLM calls.
 */

import techniqueLibraryRaw from '@/data/technique-library.json';
import type { IntakeState, ActionPlan, EducationResponse } from './schemas';

interface TechniqueLibrary {
  techniques: Array<{
    id: string;
    name: string;
    short_description: string;
    category: string;
    duration_minutes: number;
    difficulty: string;
    nap_day: number | null;
    purpose: string;
    best_for: string[];
    instructions: { summary: string; steps: string[] };
    benefits?: string[];
    source: { course: string; lesson: string; url: string };
  }>;
  obstacle_technique_map: Record<string, string[]>;
  goal_plans: Record<string, {
    name: string;
    recommended_days: number;
    primary_technique: string;
    ritual_components: string[];
    event_day_protocol: string[];
  }>;
  day_curriculum: Record<string, {
    name: string;
    focus: string;
    techniques: string[];
    time_minutes: number;
    deliverable: string;
  }>;
}

const techniqueLibrary = techniqueLibraryRaw as TechniqueLibrary;

// Human-readable labels
const OBSTACLE_LABELS: Record<string, string> = {
  anxiety: "Anxiety / Nervousness",
  low_energy: "Low Energy / Motivation",
  scattered: "Scattered Focus / Overthinking",
  emotional: "Emotional Reactivity",
  creative: "Creative Block",
  physical_tension: "Physical Tension",
  performance_anxiety: "Performance Anxiety",
  chronic_pain: "Chronic Pain Management",
};

const GOAL_LABELS: Record<string, string> = {
  presentation: "High-Stakes Presentation",
  conversation: "Difficult Conversation",
  interview: "Job Interview",
  deadline: "Creative Deadline",
  personal: "Personal Event",
  pain_management: "Pain Management Journey",
};

function generatePlanId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ns-${timestamp}-${random}`;
}

function calculateDaysUntil(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  const diffTime = event.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

function getPrimaryTechnique(obstacle: string, experience: string) {
  // Map chronic_pain to physical_tension for technique matching
  const mappedObstacle = obstacle === 'chronic_pain' ? 'physical_tension' : obstacle;
  const techniqueIds = techniqueLibrary.obstacle_technique_map[mappedObstacle] || ['coherence_breathing'];
  const primaryId = techniqueIds[0];

  const technique = techniqueLibrary.techniques.find(t => t.id === primaryId);
  if (technique?.difficulty === 'intermediate' && experience === 'none') {
    const fallbackId = techniqueIds[1] || 'breath_awareness';
    return techniqueLibrary.techniques.find(t => t.id === fallbackId) || technique;
  }

  return technique;
}

function buildSchedule(
  intake: IntakeState,
  primaryTechnique: ReturnType<typeof getPrimaryTechnique>,
  daysUntil: number
): ActionPlan['schedule'] {
  const schedule: ActionPlan['schedule'] = [];
  const planDays = Math.min(7, daysUntil);
  const dayCurriculum = techniqueLibrary.day_curriculum;

  for (let day = 1; day <= planDays; day++) {
    const dayConfig = dayCurriculum[day.toString()];
    if (!dayConfig) continue;

    const tasks: ActionPlan['schedule'][0]['tasks'] = [];

    tasks.push({
      type: 'check-in',
      technique_id: 'mbht',
      description: day === 1
        ? 'Measure your MBHT baseline (first thing after waking)'
        : 'Record your MBHT and compare to Day 1',
      duration_min: 2,
      completed: false,
    });

    dayConfig.techniques.forEach(techId => {
      if (techId === 'mbht') return;

      const technique = techniqueLibrary.techniques.find(t => t.id === techId);
      if (!technique) return;

      const scaledDuration = Math.min(
        technique.duration_minutes,
        Math.round((intake.time_commitment || 15) * 0.6)
      );

      tasks.push({
        type: 'practice',
        technique_id: techId,
        description: `${technique.name}: ${technique.instructions.summary}`,
        duration_min: scaledDuration,
        completed: false,
      });
    });

    if (day >= 3 && primaryTechnique && !dayConfig.techniques.includes(primaryTechnique.id)) {
      tasks.push({
        type: 'practice',
        technique_id: primaryTechnique.id,
        description: `${primaryTechnique.name} (Your core intervention for ${OBSTACLE_LABELS[intake.obstacle] || intake.obstacle})`,
        duration_min: primaryTechnique.duration_minutes,
        completed: false,
      });
    }

    if (day === 1) {
      tasks.push({
        type: 'journal',
        description: 'Write down 2-3 situations that trigger your symptoms. What does it feel like in your body?',
        duration_min: 5,
        completed: false,
      });
    } else if (day === 5) {
      tasks.push({
        type: 'journal',
        description: 'Draft your daily ritual: What breathing practice will you do each morning?',
        duration_min: 10,
        completed: false,
      });
    } else if (day === 7) {
      tasks.push({
        type: 'check-in',
        description: 'Rate your progress (1-10). Compare MBHT to Day 1 baseline.',
        duration_min: 5,
        completed: false,
      });
    }

    schedule.push({
      day,
      title: `Day ${day}: ${dayConfig.name}`,
      focus: dayConfig.focus,
      tasks,
    });
  }

  if (daysUntil < 7) {
    const lastDay = schedule[schedule.length - 1];
    if (lastDay) {
      lastDay.tasks.push({
        type: 'practice',
        description: 'Full daily ritual rehearsal',
        duration_min: 15,
        completed: false,
      });
    }
  }

  return schedule;
}

function buildRitual(
  intake: IntakeState,
  primaryTechnique: ReturnType<typeof getPrimaryTechnique>
): ActionPlan['ritual'] {
  const goalPlan = techniqueLibrary.goal_plans[intake.goal];

  return {
    morning: [
      'Record your MBHT (compare to Day 1 baseline)',
      `${primaryTechnique?.name || 'Coherence Breathing'} for 10 minutes`,
      'Light movement or stretching',
      'Set intention for the day',
    ],
    pre_event: [
      'Find a quiet spot',
      `5-min ${primaryTechnique?.name || 'Coherence Breathing'}`,
      'Body scan for tension areas',
      'Slow diaphragmatic breaths',
    ],
    during_event: [
      'If symptoms increase: 4-7-8 breath (3 cycles)',
      'Maintain diaphragmatic breathing awareness',
      'Pause and breathe before reacting',
      ...(goalPlan?.event_day_protocol || []),
    ],
  };
}

/**
 * Main plan generator function
 * Runs in <10ms (no AI latency)
 */
export function generatePlan(intake: IntakeState, education?: EducationResponse): ActionPlan {
  const planId = generatePlanId();
  const daysUntil = calculateDaysUntil(intake.event_date);
  const primaryTechnique = getPrimaryTechnique(intake.obstacle, intake.experience || 'some');

  const plan: ActionPlan = {
    id: planId,
    created_at: new Date().toISOString(),
    user_context: {
      goal: GOAL_LABELS[intake.goal] || intake.goal,
      obstacle: OBSTACLE_LABELS[intake.obstacle] || intake.obstacle,
      days_until: daysUntil,
    },
    matched_technique: {
      id: primaryTechnique?.id || 'coherence_breathing',
      title: primaryTechnique?.name || 'Coherence Breathing',
      description: primaryTechnique?.short_description || 'Balance your nervous system',
      duration_min: primaryTechnique?.duration_minutes || 10,
      category: primaryTechnique?.category || 'core',
    },
    schedule: buildSchedule(intake, primaryTechnique, daysUntil),
    ritual: buildRitual(intake, primaryTechnique),
    education,
  };

  return plan;
}

// In-memory store (MVP)
const planStore = new Map<string, { plan: ActionPlan; intake: IntakeState }>();

export function storePlan(plan: ActionPlan, intake: IntakeState): void {
  planStore.set(plan.id, { plan, intake });
}

export function getPlan(planId: string): { plan: ActionPlan; intake: IntakeState } | null {
  return planStore.get(planId) || null;
}
