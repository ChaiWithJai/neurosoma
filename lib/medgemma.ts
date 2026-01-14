/**
 * MedGemma Integration Layer
 *
 * Uses HuggingFace Inference Endpoint with OpenAI-compatible API.
 * Model: google/medgemma-27b-it (87.7% MedQA accuracy)
 *
 * HAI-DEF Attribution: This project uses MedGemma from Google's
 * Health AI Developer Foundations (HAI-DEF) collection.
 * https://huggingface.co/collections/google/health-ai-developer-foundations-hai-def
 */

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import * as ai from 'ai';
import { wrapAISDK } from 'langsmith/experimental/vercel';
import { Client } from 'langsmith';

// Shared LangSmith client - must be same instance for tracing + flushing
export const langsmithClient = new Client();

// Wrap AI SDK for LangSmith tracing - pass client for serverless flush
const { generateText } = wrapAISDK(ai, { client: langsmithClient });

// Create MedGemma client using OpenAI-compatible API
// HuggingFace TGI uses /v1/chat/completions endpoint
const medgemma = createOpenAICompatible({
  name: 'medgemma',
  baseURL: `${process.env.HF_MEDGEMMA_ENDPOINT}/v1`,
  apiKey: process.env.HF_API_TOKEN,
});

const EDUCATION_SYSTEM_PROMPT = `You are a medical education assistant helping chronic pain patients understand their conditions. Many of the people you help have felt "dismissed" by doctors who didn't take their symptoms seriously. Your job is to give them the knowledge AND the words to articulate their experience — so healthcare providers finally listen.

Your response MUST be structured in exactly these 6 sections with the exact headers shown:

## Anatomy & Physiology
Explain the relevant anatomy and physiological mechanisms in 2-3 paragraphs. Use clear, accessible language. Help the person understand what's happening in their body. Use proper medical terminology but explain each term.

## Research Evidence
Summarize what peer-reviewed research says about breathwork/breathing exercises for this condition. Be specific about study types (RCTs, meta-analyses) when available. If evidence is limited, say so clearly.

## How to Explain This to Your Doctor
**This is critical for dismissed patients.** Provide specific language and phrases the patient can use to describe their symptoms. Include:
- Medical terms they should use (with pronunciations if complex)
- How to describe the pattern/timing/location of symptoms precisely
- Key phrases that signal clinical significance (e.g., "radiating pain", "paresthesia", "exacerbation with...")
- What NOT to say (vague terms that get dismissed)
Example: Instead of "my back hurts", say "I have intermittent lumbar pain that radiates down my left leg, worse with sitting, rated 6/10"

## Contraindications & Precautions
List specific contraindications for breathwork with this condition. Include:
- Absolute contraindications (never do)
- Relative contraindications (proceed with caution)
- Warning signs to stop immediately
- Medication interactions to consider

## Questions for Your Doctor
Provide 4-5 specific questions the person should ask their healthcare provider, tailored to their condition and interest in breathwork.

## Important Disclaimer
Remind them this is educational information only. Emphasize the need for professional medical evaluation before starting any new practice.

Be thorough but accessible. Use bullet points where appropriate. Never minimize serious conditions.`;

export interface EducationRequest {
  healthQuestion: string;
  condition?: string;
  currentTreatments?: string;
}

export interface EducationResponse {
  anatomy_physiology: string;
  research_evidence: string;
  communication_guide: string;
  contraindications: {
    absolute: string[];
    relative: string[];
    warning_signs: string[];
    medication_notes: string;
  };
  questions_for_doctor: string[];
  disclaimer: string;
  recommended_protocol_type: 'gentle' | 'moderate' | 'standard';
  raw_response: string;
}

/**
 * Get comprehensive health education from MedGemma
 * Automatically traced via wrapAISDK
 */
export async function getHealthEducation(
  request: EducationRequest
): Promise<EducationResponse> {
  const userPrompt = buildUserPrompt(request);

  const { text } = await generateText({
    model: medgemma('google/medgemma-27b-it'),
    system: EDUCATION_SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 2048,
    temperature: 0.7,
  });

  return parseEducationResponse(text);
}

function buildUserPrompt(request: EducationRequest): string {
  let prompt = `Health question from community member:\n"${request.healthQuestion}"`;

  if (request.condition) {
    prompt += `\n\nSpecific condition mentioned: ${request.condition}`;
  }

  if (request.currentTreatments) {
    prompt += `\n\nCurrent treatments/medications: ${request.currentTreatments}`;
  }

  prompt += `\n\nPlease provide comprehensive educational information following the exact structure specified. Focus on breathwork/breathing exercises as the intervention being considered.`;

  return prompt;
}

function parseEducationResponse(text: string): EducationResponse {
  // Parse sections from markdown response
  const sections: Record<string, string> = {};
  const sectionRegex = /## ([^\n]+)\n([\s\S]*?)(?=## |$)/g;
  let match;

  while ((match = sectionRegex.exec(text)) !== null) {
    const header = match[1].trim().toLowerCase();
    const content = match[2].trim();
    sections[header] = content;
  }

  // Extract anatomy section
  const anatomy_physiology = sections['anatomy & physiology'] ||
    sections['anatomy and physiology'] ||
    extractSection(text, 'anatomy') ||
    'Please consult the full response for anatomical information.';

  // Extract research section
  const research_evidence = sections['research evidence'] ||
    extractSection(text, 'research') ||
    'Limited research evidence available for this specific query. Please consult peer-reviewed sources.';

  // Extract communication guide (for dismissed patients)
  const communication_guide = sections['how to explain this to your doctor'] ||
    sections['how to explain to your doctor'] ||
    extractSection(text, 'explain') ||
    'Use specific, measurable terms to describe your symptoms. Include location, timing, intensity (1-10 scale), and what makes it better or worse.';

  // Extract contraindications
  const contraindicationsSection = sections['contraindications & precautions'] ||
    sections['contraindications and precautions'] ||
    extractSection(text, 'contraindication') || '';

  const contraindications = parseContraindications(contraindicationsSection);

  // Extract questions
  const questionsSection = sections['questions for your doctor'] ||
    extractSection(text, 'question') || '';
  const questions_for_doctor = parseQuestions(questionsSection);

  // Extract disclaimer
  const disclaimer = sections['important disclaimer'] ||
    sections['disclaimer'] ||
    'This information is for educational purposes only and does not constitute medical advice. Please consult a qualified healthcare provider before starting any new health practice.';

  // Determine protocol type based on contraindications severity
  const recommended_protocol_type = determineProtocolType(contraindications);

  return {
    anatomy_physiology,
    research_evidence,
    communication_guide,
    contraindications,
    questions_for_doctor,
    disclaimer,
    recommended_protocol_type,
    raw_response: text,
  };
}

function extractSection(text: string, keyword: string): string {
  const lines = text.split('\n');
  let inSection = false;
  let content: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().includes(keyword) && (line.startsWith('#') || line.startsWith('**'))) {
      inSection = true;
      continue;
    }
    if (inSection && (line.startsWith('#') || line.startsWith('**'))) {
      break;
    }
    if (inSection) {
      content.push(line);
    }
  }

  return content.join('\n').trim();
}

function parseContraindications(section: string): EducationResponse['contraindications'] {
  const absolute: string[] = [];
  const relative: string[] = [];
  const warning_signs: string[] = [];
  let medication_notes = '';

  const lines = section.split('\n');
  let currentCategory = '';

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('absolute')) {
      currentCategory = 'absolute';
    } else if (lowerLine.includes('relative') || lowerLine.includes('caution')) {
      currentCategory = 'relative';
    } else if (lowerLine.includes('warning') || lowerLine.includes('stop')) {
      currentCategory = 'warning';
    } else if (lowerLine.includes('medication')) {
      currentCategory = 'medication';
    }

    const bulletMatch = line.match(/^[\s]*[-*•]\s*(.+)/);
    if (bulletMatch) {
      const item = bulletMatch[1].trim();
      if (currentCategory === 'absolute') absolute.push(item);
      else if (currentCategory === 'relative') relative.push(item);
      else if (currentCategory === 'warning') warning_signs.push(item);
      else if (currentCategory === 'medication') medication_notes += item + ' ';
      else relative.push(item); // Default to relative
    }
  }

  // Ensure we have at least defaults
  if (absolute.length === 0) {
    absolute.push('Consult healthcare provider before starting any breathwork practice');
  }
  if (warning_signs.length === 0) {
    warning_signs.push('Dizziness or lightheadedness', 'Chest pain or pressure', 'Numbness or tingling', 'Severe anxiety or panic');
  }

  return {
    absolute,
    relative,
    warning_signs,
    medication_notes: medication_notes.trim() || 'Discuss any current medications with your healthcare provider before starting breathwork.',
  };
}

function parseQuestions(section: string): string[] {
  const questions: string[] = [];
  const lines = section.split('\n');

  for (const line of lines) {
    const bulletMatch = line.match(/^[\s]*[-*•\d.]+\s*(.+)/);
    if (bulletMatch) {
      const question = bulletMatch[1].trim();
      if (question.length > 15) {
        questions.push(question);
      }
    }
  }

  if (questions.length === 0) {
    return [
      'Is breathwork safe for my specific condition?',
      'Are there any techniques I should avoid?',
      'How might my current medications interact with breathing exercises?',
      'What warning signs should prompt me to stop and seek help?',
      'Would you recommend working with a certified instructor?',
    ];
  }

  return questions.slice(0, 6);
}

function determineProtocolType(contraindications: EducationResponse['contraindications']): 'gentle' | 'moderate' | 'standard' {
  const absoluteCount = contraindications.absolute.length;
  const relativeCount = contraindications.relative.length;

  // More contraindications = gentler protocol
  if (absoluteCount > 2 || relativeCount > 4) {
    return 'gentle';
  }
  if (absoluteCount > 0 || relativeCount > 2) {
    return 'moderate';
  }
  return 'standard';
}

/**
 * Check if MedGemma endpoint is available
 */
export async function checkMedGemmaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.HF_MEDGEMMA_ENDPOINT}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
