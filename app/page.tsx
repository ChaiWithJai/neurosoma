"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Brain,
  Wind,
  AlertTriangle,
  Shield,
  BookOpen,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Users,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useNeuroSomaStore } from "@/lib/store";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { EducationResponse } from "@/lib/medgemma";
import type { MatchedProtocol } from "@/lib/protocol-matcher";

// Community question examples from real 25K WhatsApp messages
const COMMUNITY_EXAMPLES = [
  "I have 4 slipped discs and terrible back/nerve pain. Is there evidence breathwork could help reduce my pain?",
  "Does anyone have experience with Hashimoto syndrome and breathwork?",
  "I always fall asleep during breathwork sessions. Is there something wrong with me?",
  "What breathwork is safe for someone with Multiple Sclerosis?",
  "I have anxiety about my upcoming surgery. Can breathing exercises help?",
];

export default function Home() {
  const { currentView, setCurrentView } = useNeuroSomaStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            <span className="font-semibold">NeuroSoma</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="hidden sm:inline">MedGemma Impact Challenge</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === "hero" && <HeroView />}
        {currentView === "question" && <QuestionView />}
        {currentView === "results" && <ResultsView />}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-500 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Educational purposes only. Not medical advice.</span>
          </div>
          <p>
            Built with{" "}
            <a
              href="https://huggingface.co/collections/google/health-ai-developer-foundations-hai-def"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              MedGemma (HAI-DEF)
            </a>{" "}
            +{" "}
            <a
              href="https://www.somabreath.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              SOMA Breath
            </a>
          </p>
          <p className="text-slate-600">
            Created by{" "}
            <a
              href="https://grow.chaiwithjai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Jai Bhagat
            </a>
            {" "}• Breathwork instructor & AI engineer
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroView() {
  const { setCurrentView } = useNeuroSomaStore();

  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-3.5rem)]"
    >
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-400"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>65% of chronic pain patients feel dismissed by doctors</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
          >
            Finally Heard.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Finally Understood.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            MedGemma helps you <strong className="text-white">understand your condition</strong> and gives you
            the <strong className="text-white">words to explain it</strong> — so doctors finally listen.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setCurrentView("question")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Get the Words You Need
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* The Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <FlowCard
            icon={<BookOpen className="w-6 h-6" />}
            step={1}
            title="Understand Your Pain"
            description="MedGemma explains what's happening in your body in clear, medical terms"
            color="cyan"
          />
          <FlowCard
            icon={<MessageSquare className="w-6 h-6" />}
            step={2}
            title="Get the Words"
            description="Receive a communication guide with the exact language to use with doctors"
            color="amber"
          />
          <FlowCard
            icon={<Wind className="w-6 h-6" />}
            step={3}
            title="Take Action Safely"
            description="A personalized breathwork protocol matched to your condition's precautions"
            color="emerald"
          />
        </motion.div>

        {/* Dismissed Patients Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold">Real Voices from Our Community</h3>
              <p className="text-sm text-slate-400">
                From 25,000+ WhatsApp messages in SOMA Breath groups
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                quote: "My doctor said it's just stress but I KNOW there's something wrong with my back. I just can't explain it in a way they understand.",
                context: "Back pain sufferer, seeking answers"
              },
              {
                quote: "I've been to 5 specialists and no one can explain why I have this pain. I feel like I'm going crazy.",
                context: "Chronic pain patient, 2+ years undiagnosed"
              },
              {
                quote: "Every time I try to describe my symptoms, they look at me like I'm making it up. I wish I had the words.",
                context: "Fibromyalgia patient"
              },
            ].map((item, i) => (
              <div
                key={i}
                className="px-5 py-4 bg-slate-800/50 rounded-lg border-l-2 border-red-500/50"
              >
                <p className="text-slate-300 italic mb-2">"{item.quote}"</p>
                <p className="text-xs text-slate-500">— {item.context}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-sm text-slate-400">
              <span className="text-cyan-400 font-semibold">MedGemma changes this.</span>{" "}
              It gives you the medical vocabulary to be taken seriously.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FlowCard({
  icon,
  step,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
  color: "cyan" | "amber" | "emerald";
}) {
  const colors = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-sm font-bold">
        {step}
      </div>
      <div className={`w-12 h-12 ${colors[color]} border rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

function QuestionView() {
  const {
    setCurrentView,
    healthQuestion,
    setHealthQuestion,
    condition,
    setCondition,
    isLoading,
    setIsLoading,
    setError,
    setEducation,
    setProtocol,
  } = useNeuroSomaStore();

  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (healthQuestion.length < 20) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/educate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthQuestion,
          condition: condition || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get education");
      }

      setEducation(data.education);
      setProtocol(data.protocol);
      setCurrentView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const selectExample = (index: number) => {
    setSelectedExample(index);
    setHealthQuestion(COMMUNITY_EXAMPLES[index]);
  };

  return (
    <motion.div
      key="question"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-[calc(100vh-3.5rem)]"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => setCurrentView("hero")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            Ask MedGemma
          </div>
          <h2 className="text-3xl font-bold">What's your health question?</h2>
          <p className="text-slate-400 mt-2">
            Ask about a condition, symptom, or concern. MedGemma will provide education,
            identify contraindications for breathwork, and match you with a safe protocol.
          </p>
        </div>

        {/* Example Questions */}
        <div className="mb-6">
          <p className="text-sm text-slate-500 mb-3">
            Real questions from our community (25K messages):
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMUNITY_EXAMPLES.map((example, i) => (
              <button
                key={i}
                onClick={() => selectExample(i)}
                className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedExample === i
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                  : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
              >
                {example.substring(0, 50)}...
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Question</label>
            <textarea
              value={healthQuestion}
              onChange={(e) => setHealthQuestion(e.target.value)}
              placeholder="Describe your health condition or question..."
              className="w-full h-32 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{healthQuestion.length < 20 ? `${20 - healthQuestion.length} more characters needed` : "Ready to submit"}</span>
              <span>{healthQuestion.length} characters</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Condition Name <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g., herniated disc, fibromyalgia, PTSD..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={healthQuestion.length < 20 || isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with MedGemma...
              </>
            ) : (
              <>
                Get Education & Protocol
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200/80">
              <strong>Educational Only:</strong> MedGemma provides health education, not
              medical advice. Always consult a healthcare provider for diagnosis and
              treatment decisions.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ResultsView() {
  const { setCurrentView, education, protocol, activeTab, setActiveTab, healthQuestion, reset } =
    useNeuroSomaStore();

  if (!education || !protocol) {
    return null;
  }

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-[calc(100vh-3.5rem)]"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => {
            reset();
            setCurrentView("hero");
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Start Over
        </button>

        {/* Question Summary */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-8">
          <p className="text-sm text-slate-500 mb-1">Your question:</p>
          <p className="text-slate-300">{healthQuestion}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === "education"}
            onClick={() => setActiveTab("education")}
            icon={<BookOpen className="w-4 h-4" />}
            label="Education"
            color="cyan"
          />
          <TabButton
            active={activeTab === "contraindications"}
            onClick={() => setActiveTab("contraindications")}
            icon={<Shield className="w-4 h-4" />}
            label="Safety"
            color="amber"
          />
          <TabButton
            active={activeTab === "protocol"}
            onClick={() => setActiveTab("protocol")}
            icon={<Wind className="w-4 h-4" />}
            label="Protocol"
            color="emerald"
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "education" && (
            <EducationTab education={education} onNext={() => setActiveTab("contraindications")} />
          )}
          {activeTab === "contraindications" && (
            <ContraindicationsTab education={education} onNext={() => setActiveTab("protocol")} />
          )}
          {activeTab === "protocol" && <ProtocolTab protocol={protocol} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: "cyan" | "amber" | "emerald";
}) {
  const colors = {
    cyan: active ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" : "",
    amber: active ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "",
    emerald: active ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${active
        ? colors[color]
        : "bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EducationTab({
  education,
  onNext,
}: {
  education: EducationResponse;
  onNext: () => void;
}) {
  return (
    <motion.div
      key="education"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Anatomy Section */}
      <div className="card-glass-dark card-glass-glow rounded-xl p-6">
        <div className="flex items-center gap-2 text-cyan-400 mb-4">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-semibold">Anatomy & Physiology</h3>
        </div>
        <MarkdownContent content={education.anatomy_physiology} />
      </div>

      {/* Research Section */}
      <div className="card-glass-dark card-glass-glow rounded-xl p-6">
        <div className="flex items-center gap-2 text-blue-400 mb-4">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold">Research Evidence</h3>
        </div>
        <MarkdownContent content={education.research_evidence} />
      </div>

      {/* Communication Guide - Key for Dismissed Patients */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/40 rounded-xl p-6">
        <div className="flex items-center gap-2 text-amber-400 mb-4">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">How to Explain This to Your Doctor</h3>
        </div>
        <div className="bg-amber-500/5 rounded-lg p-4 mb-4 border border-amber-500/20">
          <p className="text-amber-200/80 text-sm italic">
            Use these exact phrases and terms when speaking with healthcare providers.
            Being specific and using medical vocabulary helps you be taken seriously.
          </p>
        </div>
        <MarkdownContent content={education.communication_guide} />
      </div>

      {/* Questions for Doctor */}
      <div className="card-glass-dark card-glass-glow rounded-xl p-6">
        <h3 className="font-semibold mb-4">Questions for Your Healthcare Provider</h3>
        <ul className="space-y-3">
          {education.questions_for_doctor.map((q, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center text-xs shrink-0 text-cyan-400">
                {i + 1}
              </span>
              <span className="text-slate-300">{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-all btn-glow"
      >
        View Safety Information
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function ContraindicationsTab({
  education,
  onNext,
}: {
  education: EducationResponse;
  onNext: () => void;
}) {
  const { contraindications } = education;

  return (
    <motion.div
      key="contraindications"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-300">Safety Screening Results</h3>
            <p className="text-sm text-amber-200/70 mt-1">
              Based on your health question, here are important considerations for breathwork practice.
            </p>
          </div>
        </div>
      </div>

      {/* Absolute Contraindications */}
      {contraindications.absolute.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="font-semibold text-red-400 mb-4">Consult Doctor First</h3>
          <ul className="space-y-2">
            {contraindications.absolute.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-red-200/80">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <MarkdownContent content={item} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Relative Contraindications */}
      {contraindications.relative.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <h3 className="font-semibold text-amber-400 mb-4">Proceed with Caution</h3>
          <ul className="space-y-2">
            {contraindications.relative.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-amber-200/80">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <MarkdownContent content={item} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning Signs */}
      <div className="card-glass-dark rounded-xl p-6">
        <h3 className="font-semibold mb-4">Stop Immediately If You Experience</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {contraindications.warning_signs.map((sign, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg text-slate-300 text-sm"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <MarkdownContent content={sign} />
            </div>
          ))}
        </div>
      </div>

      {/* Medication Notes */}
      <div className="card-glass-dark rounded-xl p-6">
        <h3 className="font-semibold mb-2">Medication Considerations</h3>
        <MarkdownContent content={contraindications.medication_notes} className="text-slate-400" />
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl font-medium hover:bg-emerald-500/30 transition-colors"
      >
        View Matched Protocol
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function ProtocolTab({
  protocol,
}: {
  protocol: MatchedProtocol;
}) {
  return (
    <motion.div
      key="protocol"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Protocol Header */}
      <div className="card-glass-dark card-glass-glow bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-emerald-400">Matched Protocol</span>
            </div>
            <h2 className="text-2xl font-bold">{protocol.name}</h2>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Duration</div>
            <div className="text-2xl font-bold text-emerald-400">{protocol.duration_weeks} weeks</div>
          </div>
        </div>
        <p className="text-slate-300">{protocol.description}</p>
        <div className="flex gap-4 mt-4 text-sm">
          {protocol.audio_guided && (
            <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 badge-glow">
              🎧 Audio Guided
            </span>
          )}
          {protocol.mbht_tracking && (
            <span className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 badge-glow">
              📊 MBHT Tracking
            </span>
          )}
        </div>
      </div>

      {/* Rationale */}
      <div className="card-glass-dark rounded-xl p-6">
        <h3 className="font-semibold mb-2">Why This Protocol</h3>
        <MarkdownContent content={protocol.rationale} />
      </div>

      {/* Weekly Breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold">Weekly Progression</h3>
        {protocol.weeks.map((week) => (
          <div key={week.week} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-emerald-400">Week {week.week}</span>
                <h4 className="font-semibold">{week.title}</h4>
              </div>
              <span className="text-sm text-slate-500">{week.duration}</span>
            </div>

            <p className="text-slate-400 mb-4">{week.focus}</p>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Techniques</span>
                <ul className="mt-2 space-y-1">
                  {week.techniques.map((tech, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {week.cautions.length > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs text-amber-500 uppercase tracking-wide">Cautions</span>
                  <ul className="mt-2 space-y-1">
                    {week.cautions.map((caution, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-amber-200/70">
                        <AlertTriangle className="w-4 h-4" />
                        {caution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
        <strong>Important:</strong> {protocol.rationale.includes("healthcare provider") ? "" : "Always consult your healthcare provider before starting this protocol. "}
        Protocol designed by{" "}
        <a href="https://grow.chaiwithjai.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
          Jai Bhagat
        </a>
        , certified SOMA Breath instructor.
      </div>
    </motion.div>
  );
}
