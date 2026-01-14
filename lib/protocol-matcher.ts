/**
 * Protocol Matcher
 *
 * Maps health conditions to appropriate breathwork protocols
 * designed by Jai Bhagat (grow.chaiwithjai.com), certified SOMA Breath instructor.
 */

import type { EducationResponse } from './medgemma';

export type ProtocolType = 'gentle' | 'moderate' | 'standard';

export interface ProtocolWeek {
  week: number;
  title: string;
  focus: string;
  techniques: string[];
  duration: string;
  frequency: string;
  objectives: string[];
  cautions: string[];
}

export interface MatchedProtocol {
  type: ProtocolType;
  name: string;
  description: string;
  duration_weeks: number;
  evaluation_score: number;
  weeks: ProtocolWeek[];
  mbht_tracking: boolean;
  audio_guided: boolean;
  rationale: string;
}

/**
 * Match a protocol based on MedGemma's contraindications analysis
 */
export function matchProtocol(
  protocolType: ProtocolType,
  condition?: string
): MatchedProtocol {
  switch (protocolType) {
    case 'gentle':
      return getGentleProtocol(condition);
    case 'moderate':
      return getModerateProtocol(condition);
    case 'standard':
    default:
      return getStandardProtocol(condition);
  }
}

function getGentleProtocol(condition?: string): MatchedProtocol {
  return {
    type: 'gentle',
    name: 'Gentle Activation Protocol',
    description: 'A conservative breathwork approach focused on parasympathetic activation without intensive techniques. Designed for conditions requiring extra caution.',
    duration_weeks: 2,
    evaluation_score: 0.81,
    mbht_tracking: false,
    audio_guided: true,
    rationale: `Based on your health profile${condition ? ` (${condition})` : ''}, we recommend starting with our gentlest protocol. This focuses on parasympathetic activation through extended exhalation, avoiding breath holds or intensive techniques.`,
    weeks: [
      {
        week: 1,
        title: 'Foundation: Extended Exhalation',
        focus: 'Parasympathetic activation through 4:8 breathing pattern',
        techniques: [
          '4:8 Extended Exhalation (4-second inhale, 8-second exhale)',
          'Diaphragmatic breathing awareness',
          'Gentle body scan',
        ],
        duration: '10-15 minutes per session',
        frequency: 'Daily, preferably evening',
        objectives: [
          'Execute 4:8 breathing pattern for 10+ minutes',
          'Understand physiological basis for breath-based healing',
        ],
        cautions: [
          'Stop if you feel dizzy or lightheaded',
          'No breath holds in this protocol',
          'Listen to your body - shorter sessions are fine',
        ],
      },
      {
        week: 2,
        title: 'Deepening: Relaxation Response',
        focus: 'Building consistency and body awareness',
        techniques: [
          '4:8 Extended Exhalation (continued)',
          'Progressive muscle relaxation with breath',
          'Gentle visualization (optional)',
        ],
        duration: '15-20 minutes per session',
        frequency: 'Daily',
        objectives: [
          'Sustain 4:8 pattern with ease',
          'Notice relaxation response in body',
        ],
        cautions: [
          'Continue avoiding breath holds',
          'Consult healthcare provider before advancing',
        ],
      },
    ],
  };
}

function getModerateProtocol(condition?: string): MatchedProtocol {
  return {
    type: 'moderate',
    name: 'Adaptive Healing Protocol',
    description: 'A balanced breathwork approach with modified breath holds and visualization. Suitable for most conditions with some precautions.',
    duration_weeks: 3,
    evaluation_score: 0.81,
    mbht_tracking: true,
    audio_guided: true,
    rationale: `Based on your health profile${condition ? ` (${condition})` : ''}, we recommend our adaptive protocol. This includes gentle breath retention with the "release at first urge" principle, ensuring safety while providing deeper benefits.`,
    weeks: [
      {
        week: 1,
        title: 'Foundation: Extended Exhalation',
        focus: 'Parasympathetic activation through 4:8 breathing',
        techniques: [
          '4:8 Extended Exhalation',
          'SOMA Daily Dose (modified - shorter holds)',
          'Basic MBHT measurement',
        ],
        duration: '15-22 minutes per session',
        frequency: 'Daily',
        objectives: [
          'Execute 4:8 breathing pattern',
          'Complete modified Daily Dose session',
          'Establish MBHT baseline',
        ],
        cautions: [
          'Release breath holds at FIRST urge - never force',
          'Stop if any concerning symptoms arise',
        ],
      },
      {
        week: 2,
        title: 'Building: Coherent Breathing',
        focus: 'Heart coherence and visualization',
        techniques: [
          '4:4 Coherent Breathing',
          'Directed healing visualization',
          'AUM chanting (optional)',
        ],
        duration: '20-25 minutes per session',
        frequency: 'Daily',
        objectives: [
          'Execute 4:4 coherent breathing',
          'Practice visualization during gentle holds',
        ],
        cautions: [
          'Continue monitoring how you feel',
          'Skip AUM if any respiratory concerns',
        ],
      },
      {
        week: 3,
        title: 'Integration: Pattern Selection',
        focus: 'Learning to match techniques to your state',
        techniques: [
          'Pattern selection based on energy/healing phase',
          'Full SOMA Energized Meditation (modified)',
          'Progress tracking with MBHT',
        ],
        duration: '25-30 minutes per session',
        frequency: 'Daily or 5x/week',
        objectives: [
          'Select appropriate pattern for current state',
          'Track progress with MBHT measurements',
        ],
        cautions: [
          'Review with healthcare provider before continuing',
        ],
      },
    ],
  };
}

function getStandardProtocol(condition?: string): MatchedProtocol {
  return {
    type: 'standard',
    name: 'Complete Healing Protocol',
    description: 'The full SOMA breathwork progression designed for optimal healing. Based on Jai\'s instructional design evaluations using his "Data to Wisdom" evaluation system with 0.81 composite score.',
    duration_weeks: 4,
    evaluation_score: 0.81,
    mbht_tracking: true,
    audio_guided: true,
    rationale: `Based on your health profile${condition ? ` (${condition})` : ''}, you can follow our complete protocol. This provides the full progression from parasympathetic activation through advanced integration practices.`,
    weeks: [
      {
        week: 1,
        title: 'Foundation: Parasympathetic Activation',
        focus: '4:8 breathing for rest-and-digest state',
        techniques: [
          '4:8 Extended Exhalation',
          'SOMA Daily Dose with breath retention',
          'Basic visualization during holds',
        ],
        duration: '22 minutes per session',
        frequency: 'Daily',
        objectives: [
          'Execute 4:8 breathing for 10+ minutes',
          'Complete full Daily Dose session',
          'Establish MBHT baseline',
        ],
        cautions: [
          'Release at first urge - never force holds',
        ],
      },
      {
        week: 2,
        title: 'Building: Heart Coherence',
        focus: '4:4 breathing and directed healing',
        techniques: [
          '4:4 Coherent Breathing',
          'AUM Chanting',
          'Advanced visualization during holds',
          'MBHT tracking',
        ],
        duration: '25-30 minutes per session',
        frequency: 'Daily',
        objectives: [
          'Execute 4:4 coherent breathing',
          'Practice AUM with resonance',
          'Direct visualization to areas of concern',
        ],
        cautions: [],
      },
      {
        week: 3,
        title: 'Expansion: Energized Meditation',
        focus: 'Full SOMA sequence and pattern mastery',
        techniques: [
          'Full Energized Meditation (Move-Chant-Breathe)',
          'Pattern selection based on needs',
          'Energizing patterns (2:2) when appropriate',
        ],
        duration: '30-45 minutes per session',
        frequency: 'Daily or 5x/week',
        objectives: [
          'Complete full Energized Meditation',
          'Differentiate and select appropriate patterns',
        ],
        cautions: [],
      },
      {
        week: 4,
        title: 'Integration: Mastery & Design',
        focus: 'Advanced states and personal practice design',
        techniques: [
          'Kevala continuous flow breathing',
          'Integration journeys',
          'Personal practice plan design',
        ],
        duration: '30-60 minutes per session',
        frequency: '5x/week',
        objectives: [
          'Experience Kevala states',
          'Evaluate progress with MBHT trends',
          'Design ongoing personal practice',
        ],
        cautions: [],
      },
    ],
  };
}

/**
 * Get protocol summary for display
 */
export function getProtocolSummary(protocol: MatchedProtocol): string {
  return `${protocol.name} (${protocol.duration_weeks} weeks) - ${protocol.description}`;
}

/**
 * Get safety badge based on protocol type
 */
export function getSafetyBadge(type: ProtocolType): { label: string; color: string } {
  switch (type) {
    case 'gentle':
      return { label: 'Maximum Safety', color: 'green' };
    case 'moderate':
      return { label: 'Modified for Safety', color: 'yellow' };
    case 'standard':
      return { label: 'Standard Protocol', color: 'blue' };
  }
}
