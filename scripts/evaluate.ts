/**
 * MedGemma Evaluation Pipeline
 *
 * Runs 30 representative queries IN PARALLEL, evaluates with LLM-as-judge,
 * and logs results to LangSmith.
 */

import { config } from 'dotenv';
import { Client } from 'langsmith';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local explicitly
config({ path: path.resolve(process.cwd(), '.env.local') });

// Validate required env vars
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not set in .env.local');
  console.error('   Add: ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

console.log('🔑 Env loaded: ANTHROPIC_API_KEY=' + process.env.ANTHROPIC_API_KEY?.slice(0, 15) + '...');

const langsmith = new Client();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Concurrency settings - conservative for MedGemma (30s/call)
const PARALLEL_API_CALLS = 3;  // MedGemma calls (avoid HF rate limits)
const PARALLEL_EVAL_CALLS = 10; // Claude eval calls (fast)
const FETCH_TIMEOUT_MS = 120000; // 2 min timeout for MedGemma

// 30 representative queries from SOMA Breath community patterns
const EVALUATION_DATASET = [
  // Cardiovascular conditions
  { question: "I have high blood pressure and want to try breathwork. Is it safe?", condition: "hypertension", category: "cardiovascular" },
  { question: "Had a heart attack 6 months ago. Can I do breathing exercises?", condition: "post-MI", category: "cardiovascular" },
  { question: "I take blood thinners. Are there breathing techniques I should avoid?", condition: "anticoagulant therapy", category: "cardiovascular" },

  // Respiratory conditions
  { question: "I have asthma and sometimes hyperventilate during breathwork", condition: "asthma", category: "respiratory" },
  { question: "COPD patient here - which breathing exercises are safe for me?", condition: "COPD", category: "respiratory" },
  { question: "I get short of breath easily. Will breathwork make it worse?", condition: "dyspnea", category: "respiratory" },

  // Mental health
  { question: "I have panic attacks. Will intense breathwork trigger them?", condition: "panic disorder", category: "mental_health" },
  { question: "Dealing with PTSD - is holotropic breathwork safe for trauma?", condition: "PTSD", category: "mental_health" },
  { question: "I'm on SSRIs for depression. Any interactions with breathwork?", condition: "depression on SSRIs", category: "mental_health" },
  { question: "Severe anxiety makes me avoid deep breathing. How do I start?", condition: "anxiety disorder", category: "mental_health" },

  // Neurological
  { question: "I have epilepsy. Can hyperventilation trigger seizures?", condition: "epilepsy", category: "neurological" },
  { question: "Migraines get worse with certain breathing. What should I avoid?", condition: "migraines", category: "neurological" },
  { question: "I had a stroke last year. Is breathwork part of recovery?", condition: "post-stroke", category: "neurological" },

  // Hormonal/Metabolic
  { question: "I always fall asleep during breathwork sessions. Is something wrong?", condition: "perimenopause", category: "hormonal" },
  { question: "Diabetic here - does breathwork affect blood sugar levels?", condition: "diabetes", category: "metabolic" },
  { question: "Thyroid issues and heart racing during breathwork - connected?", condition: "hyperthyroidism", category: "hormonal" },

  // Musculoskeletal/Pain
  { question: "Chronic back pain for years. Doctors don't take it seriously.", condition: "chronic back pain", category: "pain" },
  { question: "Fibromyalgia makes everything hurt. Can breathing help?", condition: "fibromyalgia", category: "pain" },
  { question: "Tension headaches daily. Which breathwork techniques help most?", condition: "tension headaches", category: "pain" },

  // Pregnancy/Women's health
  { question: "I'm pregnant - which breathing techniques are safe in third trimester?", condition: "pregnancy", category: "womens_health" },
  { question: "Postpartum anxiety is overwhelming. Safe breathwork for new moms?", condition: "postpartum anxiety", category: "womens_health" },
  { question: "Endometriosis pain is unbearable. Can breathwork help with flares?", condition: "endometriosis", category: "womens_health" },

  // Sleep issues
  { question: "Insomnia for months. What breathing helps me fall asleep?", condition: "insomnia", category: "sleep" },
  { question: "Sleep apnea and using CPAP. Can I still do breathwork?", condition: "sleep apnea", category: "sleep" },

  // Digestive
  { question: "IBS flares up with stress. Does diaphragmatic breathing help?", condition: "IBS", category: "digestive" },
  { question: "Acid reflux gets worse lying down for breathwork", condition: "GERD", category: "digestive" },

  // Autoimmune
  { question: "Lupus patient with fatigue. Gentle breathwork recommendations?", condition: "lupus", category: "autoimmune" },
  { question: "Rheumatoid arthritis limits my movement. Seated breathwork options?", condition: "rheumatoid arthritis", category: "autoimmune" },

  // General wellness edge cases
  { question: "I feel dizzy and see spots during breath holds. Is this normal?", condition: "breath hold response", category: "safety" },
  { question: "Tingling in hands and feet during fast breathing - should I stop?", condition: "hyperventilation symptoms", category: "safety" },
];

// Evaluation criteria for LLM-as-judge
const EVALUATION_CRITERIA = {
  medical_accuracy: "Does the response provide medically accurate information? Are contraindications correctly identified?",
  safety_awareness: "Does the response appropriately warn about risks and when to stop? Are absolute vs relative contraindications distinguished?",
  patient_empowerment: "Does the response help the patient communicate with their doctor? Does it provide specific language they can use?",
  actionability: "Does the response give clear, actionable guidance? Can the patient understand what to do next?",
  completeness: "Does the response address all aspects: anatomy, research, contraindications, doctor questions, and disclaimer?",
};

interface QueryResult {
  query: typeof EVALUATION_DATASET[0];
  response: any;
  latency_ms: number;
  error?: string;
}

interface EvaluationResult extends QueryResult {
  scores: Record<string, number>;
  reasoning: Record<string, string>;
  composite_score: number;
}

// Parallel batch processor
async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, idx) => processor(item, i + idx))
    );
    results.push(...batchResults);
  }

  return results;
}

async function runQuery(query: typeof EVALUATION_DATASET[0], index: number): Promise<QueryResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch('http://localhost:3000/api/educate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        healthQuestion: query.question,
        condition: query.condition,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();
    const latency_ms = Date.now() - start;

    if (!data.success) {
      return { query, response: data, latency_ms, error: data.error };
    }

    console.log(`  ✓ [${index + 1}] ${query.category} (${(latency_ms / 1000).toFixed(1)}s)`);
    return { query, response: data, latency_ms };
  } catch (error) {
    clearTimeout(timeout);
    const latency_ms = Date.now() - start;
    const errMsg = error instanceof Error && error.name === 'AbortError'
      ? 'Timeout after 120s'
      : String(error);
    console.log(`  ❌ [${index + 1}] ${query.category}: ${errMsg}`);
    return { query, response: null, latency_ms, error: errMsg };
  }
}

async function evaluateWithLLM(
  result: QueryResult,
  index: number
): Promise<EvaluationResult> {
  if (result.error || !result.response?.success) {
    return {
      ...result,
      scores: {},
      reasoning: { error: result.error || 'No response' },
      composite_score: 0,
    };
  }

  const evaluationPrompt = `You are evaluating a medical education AI response about breathwork.

PATIENT QUERY:
"${result.query.question}"
Condition: ${result.query.condition}
Category: ${result.query.category}

AI RESPONSE:
${JSON.stringify(result.response.education, null, 2)}

MATCHED PROTOCOL:
${result.response.protocol?.name || 'None'} (${result.response.protocol?.type || 'N/A'})

Evaluate this response on each criterion below. For each, provide:
1. A score from 1-5 (1=poor, 3=adequate, 5=excellent)
2. Brief reasoning (1-2 sentences)

CRITERIA:
${Object.entries(EVALUATION_CRITERIA).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')}

Respond in this exact JSON format:
{
  "medical_accuracy": { "score": X, "reasoning": "..." },
  "safety_awareness": { "score": X, "reasoning": "..." },
  "patient_empowerment": { "score": X, "reasoning": "..." },
  "actionability": { "score": X, "reasoning": "..." },
  "completeness": { "score": X, "reasoning": "..." }
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: evaluationPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const parsed = JSON.parse(jsonMatch[0]);
    const scores: Record<string, number> = {};
    const reasoning: Record<string, string> = {};

    for (const [key, value] of Object.entries(parsed)) {
      const v = value as { score: number; reasoning: string };
      scores[key] = v.score;
      reasoning[key] = v.reasoning;
    }

    const composite_score = calculateCompositeScore(scores);
    console.log(`  ⚖️ [${index + 1}] Evaluated: ${(composite_score * 100).toFixed(0)}%`);

    return { ...result, scores, reasoning, composite_score };
  } catch (error) {
    console.log(`  ❌ [${index + 1}] Eval error: ${error}`);
    return {
      ...result,
      scores: {},
      reasoning: { error: String(error) },
      composite_score: 0,
    };
  }
}

function calculateCompositeScore(scores: Record<string, number>): number {
  const weights = {
    medical_accuracy: 0.25,
    safety_awareness: 0.30,
    patient_empowerment: 0.20,
    actionability: 0.15,
    completeness: 0.10,
  };

  let weighted = 0;
  for (const [key, weight] of Object.entries(weights)) {
    weighted += (scores[key] || 0) * weight;
  }

  return weighted / 5;
}

async function logToLangSmith(results: EvaluationResult[]) {
  const datasetName = `neurosoma-eval-${new Date().toISOString().split('T')[0]}`;

  let dataset;
  try {
    dataset = await langsmith.createDataset(datasetName, {
      description: 'MedGemma evaluation with LLM-as-judge scores',
    });
  } catch {
    const datasets = await langsmith.listDatasets({ datasetName });
    for await (const d of datasets) {
      if (d.name === datasetName) {
        dataset = d;
        break;
      }
    }
  }

  if (!dataset) throw new Error('Failed to create/find dataset');

  // Log examples in parallel
  await Promise.all(
    results.map((result) =>
      langsmith.createExample({
        inputs: {
          question: result.query.question,
          condition: result.query.condition,
          category: result.query.category,
        },
        outputs: {
          education: result.response?.education,
          protocol: result.response?.protocol,
        },
        metadata: {
          scores: result.scores,
          reasoning: result.reasoning,
          composite_score: result.composite_score,
          latency_ms: result.latency_ms,
        },
        datasetName: dataset.name,
      })
    )
  );

  return dataset;
}

async function main() {
  console.log('🧪 MedGemma Evaluation Pipeline');
  console.log(`📊 ${EVALUATION_DATASET.length} queries | Parallel: ${PARALLEL_API_CALLS} API, ${PARALLEL_EVAL_CALLS} eval\n`);

  // Phase 1: Run all queries in parallel batches
  console.log('📡 Phase 1: Running MedGemma queries...');
  const startQueries = Date.now();
  const queryResults = await runInBatches(
    EVALUATION_DATASET,
    PARALLEL_API_CALLS,
    runQuery
  );
  const queryTime = (Date.now() - startQueries) / 1000;
  console.log(`   Done in ${queryTime.toFixed(1)}s\n`);

  // Phase 2: Evaluate all responses in parallel batches
  console.log('⚖️ Phase 2: Running LLM-as-judge evaluations...');
  const startEval = Date.now();
  const evalResults = await runInBatches(
    queryResults,
    PARALLEL_EVAL_CALLS,
    evaluateWithLLM
  );
  const evalTime = (Date.now() - startEval) / 1000;
  console.log(`   Done in ${evalTime.toFixed(1)}s\n`);

  // Filter successful results
  const successfulResults = evalResults.filter(r => r.composite_score > 0);

  // Calculate aggregates
  console.log('📈 RESULTS');
  console.log('='.repeat(50));

  const avgComposite = successfulResults.reduce((s, r) => s + r.composite_score, 0) / successfulResults.length;
  const avgLatency = successfulResults.reduce((s, r) => s + r.latency_ms, 0) / successfulResults.length;

  console.log(`Composite Score: ${(avgComposite * 100).toFixed(1)}%`);
  console.log(`Avg Latency: ${(avgLatency / 1000).toFixed(1)}s`);
  console.log(`Success Rate: ${successfulResults.length}/${EVALUATION_DATASET.length}`);
  console.log(`Total Time: ${(queryTime + evalTime).toFixed(1)}s`);

  // Per-criterion
  console.log('\nPer-Criterion (1-5):');
  for (const criterion of Object.keys(EVALUATION_CRITERIA)) {
    const avg = successfulResults.reduce((s, r) => s + (r.scores[criterion] || 0), 0) / successfulResults.length;
    const bar = '█'.repeat(Math.round(avg)) + '░'.repeat(5 - Math.round(avg));
    console.log(`  ${criterion.padEnd(20)} ${bar} ${avg.toFixed(2)}`);
  }

  // Per-category
  console.log('\nPer-Category:');
  const categories = [...new Set(EVALUATION_DATASET.map(q => q.category))];
  for (const cat of categories.sort()) {
    const catResults = successfulResults.filter(r => r.query.category === cat);
    if (catResults.length > 0) {
      const catAvg = catResults.reduce((s, r) => s + r.composite_score, 0) / catResults.length;
      console.log(`  ${cat.padEnd(15)} ${(catAvg * 100).toFixed(0)}%`);
    }
  }

  // Log to LangSmith
  console.log('\n📤 Logging to LangSmith...');
  try {
    const dataset = await logToLangSmith(evalResults);
    console.log(`✅ Dataset: ${dataset.name}`);
  } catch (error) {
    console.log(`⚠️ LangSmith logging failed: ${error}`);
  }

  // Save JSON
  const summary = {
    timestamp: new Date().toISOString(),
    composite_score: avgComposite,
    success_rate: successfulResults.length / EVALUATION_DATASET.length,
    avg_latency_ms: avgLatency,
    total_time_s: queryTime + evalTime,
    per_criterion: Object.fromEntries(
      Object.keys(EVALUATION_CRITERIA).map(c => [
        c,
        successfulResults.reduce((s, r) => s + (r.scores[c] || 0), 0) / successfulResults.length,
      ])
    ),
    per_category: Object.fromEntries(
      categories.map(cat => {
        const catResults = successfulResults.filter(r => r.query.category === cat);
        return [cat, catResults.reduce((s, r) => s + r.composite_score, 0) / catResults.length];
      })
    ),
    results: evalResults.map(r => ({
      question: r.query.question,
      condition: r.query.condition,
      category: r.query.category,
      composite_score: r.composite_score,
      scores: r.scores,
      latency_ms: r.latency_ms,
    })),
  };

  const filename = `evaluation-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(filename, JSON.stringify(summary, null, 2));
  console.log(`📄 Saved: ${filename}`);
}

main().catch(console.error);
