import { z } from 'zod';

// 1. Technique Library Schema
export interface Technique {
  id: string;
  name: string;
  short_description: string;
  duration_minutes: number;
  video_url?: string;
  audio_url?: string;
  category: "regulation" | "activation" | "integration" | "foundation" | "physical" | "assessment" | "advanced" | "core";
  tags?: string[];
}

// 2. Symptom Input Schema (NEW - for MedGemma education)
export const SymptomSchema = z.object({
  description: z.string().min(10, "Please describe your symptoms in more detail"),
  duration: z.enum(["days", "weeks", "months", "years"]).optional(),
  location: z.string().optional(),
});

export type SymptomInput = z.infer<typeof SymptomSchema>;

// 3. Intake Submission Schema
export const IntakeSchema = z.object({
  goal: z.enum(["presentation", "conversation", "interview", "deadline", "personal", "pain_management"]),
  event_date: z.string(),
  obstacle: z.enum(["anxiety", "low_energy", "scattered", "emotional", "creative", "physical_tension", "performance_anxiety", "chronic_pain"]),
  time_commitment: z.number().optional().default(15),
  experience: z.enum(["none", "some", "regular"]).optional().default("some"),
  email: z.string().email().optional(),
  // NEW: Link to symptom description for MedGemma education
  symptom_description: z.string().optional(),
});

export type IntakeState = z.infer<typeof IntakeSchema>;

// 4. MedGemma Education Response Schema (NEW)
export const EducationResponseSchema = z.object({
  anatomical_explanation: z.string(),
  limitations_statement: z.string(),
  questions_for_doctor: z.array(z.string()),
  disclaimer: z.string(),
});

export type EducationResponse = z.infer<typeof EducationResponseSchema>;

// 5. Generated Artifact Zod Schema (For AI SDK)
export const actionPlanSchema = z.object({
  user_context: z.object({
    goal: z.string(),
    obstacle: z.string(),
    days_until: z.number(),
  }),
  matched_technique: z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    duration_min: z.number(),
    category: z.string().optional(),
  }),
  schedule: z.array(z.object({
    day: z.number(),
    title: z.string(),
    focus: z.string(),
    tasks: z.array(z.object({
      type: z.string(),
      description: z.string(),
      duration_min: z.number(),
      technique_id: z.string().optional(),
      completed: z.boolean().optional().default(false),
    })),
  })),
  ritual: z.object({
    morning: z.array(z.string()),
    pre_event: z.array(z.string()),
    during_event: z.array(z.string()),
  }),
});

// 6. Full Action Plan Interface (Application State)
export type ActionPlan = z.infer<typeof actionPlanSchema> & {
  id: string;
  created_at: string;
  matched_technique: {
    id: string;
    category: string;
  };
  // NEW: Optional education from MedGemma
  education?: EducationResponse;
};
