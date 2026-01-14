# NeuroSoma

**Finally Heard. Finally Understood.**

> 🏆 Built for the [MedGemma Impact Challenge](https://www.kaggle.com/competitions/med-gemma-impact-challenge) on Kaggle

## The Problem: Dismissed Patients

**80% of women have had their pain dismissed by healthcare providers.** They're told "it's just stress" or "there's nothing wrong" — but they *know* something is happening in their body. The issue isn't that they're imagining it. The issue is they lack the **medical vocabulary** to describe their experience in a way healthcare providers take seriously.

> "My doctor said it's just stress but I KNOW there's something wrong with my back. I just can't explain it in a way they understand."
> — Real message from breathwork and wellness groups (25,000+ analyzed)

## The Solution: MedGemma Gives You the Words

NeuroSoma uses **MedGemma 27B** to transform how dismissed patients prepare for doctor visits:

1. **Understand Your Pain** — Learn what's happening anatomically in clear, clinical terms
2. **Get the Words** — Receive a **Communication Guide** with the exact medical vocabulary to use
3. **Take Action Safely** — Get a breathwork protocol matched to your condition's precautions

## HAI-DEF Model Attribution

This project uses **MedGemma 27B** from Google's [Health AI Developer Foundations (HAI-DEF)](https://huggingface.co/collections/google/health-ai-developer-foundations-hai-def) collection.

- **Model**: `google/medgemma-27b-it`
- **Architecture**: Gemma 3 decoder-only transformer  
- **Performance**: 87.7% on MedQA (within 3 points of DeepSeek R1 at 1/10th inference cost)
- **License**: Gemma Terms of Use

MedGemma powers the **Communication Guide** — teaching dismissed patients the specific phrases, medical terms, and language patterns that help them be taken seriously by healthcare providers.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- **AI Integration**: Vercel AI SDK v6, HuggingFace Inference Endpoints
- **Medical AI**: MedGemma 27B (HAI-DEF) via OpenAI-compatible API
- **Breathwork Engine**: Deterministic plan generator (<10ms, no LLM needed)
- **State Management**: Zustand
- **Validation**: Zod

## Quick Start

### Prerequisites

- Node.js 18+
- HuggingFace account with MedGemma access
- HuggingFace Inference Endpoint (or use provided endpoint)

### Installation

```bash
# Clone the repository
git clone https://github.com/chaiwithjai/neurosoma.git
cd neurosoma

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
# HF_MEDGEMMA_ENDPOINT=your-endpoint-url
# HF_API_TOKEN=your-hf-token

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_MEDGEMMA_ENDPOINT` | Yes | HuggingFace Inference Endpoint URL |
| `HF_API_TOKEN` | Yes | HuggingFace API token |
| `NEXT_PUBLIC_BASE_URL` | No | Public URL for sharing (defaults to localhost) |

## Architecture

```
User Flow:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Symptom Input   │────▶│ MedGemma        │────▶│ Breathwork Plan │
│ (User describes │     │ Education       │     │ (7-day SOMA     │
│  symptoms)      │     │ (AI analysis)   │     │  protocol)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### API Endpoints

- `POST /api/educate` — Get MedGemma education response for symptoms
- `POST /api/create-plan` — Generate personalized breathwork plan
- `GET /api/plan/[id]` — Retrieve saved plan

## Responsible AI Disclosure

### What This Tool IS

- **Educational** — Helps patients understand potential anatomical connections
- **Preparatory** — Generates questions for doctor visits
- **Supportive** — Provides breathwork techniques for symptom management

### What This Tool IS NOT

- **Diagnostic** — Cannot determine the cause of symptoms
- **Medical Advice** — Does not replace professional healthcare
- **Treatment** — Breathwork is complementary, not curative

### Known Limitations

- Dermatome patterns are only **30-35% predictive** of underlying conditions
- MedGemma has **no MSK training data** — responses are based on general medical knowledge
- Individual responses to breathwork vary significantly

## Project Structure

```
neurosoma/
├── app/
│   ├── api/
│   │   ├── educate/          # MedGemma education endpoint
│   │   ├── create-plan/      # Plan generation endpoint
│   │   └── plan/[id]/        # Plan retrieval endpoint
│   ├── page.tsx              # Main app (hero → intake → plan)
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Design system
├── components/
│   ├── SymptomInput.tsx      # Symptom description form
│   ├── EducationCard.tsx     # MedGemma response display
│   └── PlanDisplay.tsx       # Breathwork plan with tasks
├── lib/
│   ├── medgemma.ts           # MedGemma client wrapper
│   ├── plan-generator.ts     # Deterministic plan generation
│   ├── schemas.ts            # Zod validation schemas
│   └── store.ts              # Zustand state management
└── data/
    └── technique-library.json # SOMA Breath techniques
```

## Competition Submission

### Required Elements

- [x] Public code repository
- [x] HAI-DEF model attribution
- [x] Working prototype

### Bonus Elements

- [x] Public interactive demo (Vercel deployment)
- [x] Open-weight model tracing to MedGemma (HAI-DEF)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables:
   - `HF_MEDGEMMA_ENDPOINT`
   - `HF_API_TOKEN`
4. Deploy

### Other Platforms

The app is a standard Next.js 16 application and can be deployed to any platform that supports Next.js.

## Credits

- **MedGemma**: Google Health AI Developer Foundations
- **SOMA Breath**: Breathwork technique library and protocols
- **Vercel AI SDK**: AI integration framework

## License

Apache 2.0 — See [LICENSE](LICENSE)

---

Built with ❤️ for the [MedGemma Impact Challenge](https://www.kaggle.com/competitions/med-gemma-impact-challenge)
