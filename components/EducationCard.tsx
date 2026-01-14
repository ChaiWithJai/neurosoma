"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Brain, AlertTriangle, HelpCircle, Wind } from "lucide-react";
import { useNeuroSomaStore } from "@/lib/store";

export function EducationCard() {
  const { setCurrentView, education, symptomDescription } = useNeuroSomaStore();

  if (!education) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <p className="text-muted-foreground">No education data available.</p>
      </div>
    );
  }

  return (
    <motion.div
      key="education"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 py-12"
    >
      <div className="container-safe">
        {/* Back button */}
        <button
          onClick={() => setCurrentView("symptoms")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit symptoms
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-education/10 rounded-full text-xs text-education">
              Step 2 of 3 • MedGemma Analysis
            </div>
            <h2 className="text-2xl font-bold">Understanding Your Symptoms</h2>
            <p className="text-sm text-muted-foreground">
              Based on: "{symptomDescription.substring(0, 100)}..."
            </p>
          </div>

          {/* Anatomical Explanation */}
          <div className="card-plush space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-education/10 rounded-lg flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-education" />
              </div>
              <div>
                <h3 className="font-semibold">Educational Explanation</h3>
                <p className="text-xs text-muted-foreground">
                  Powered by MedGemma 27B (HAI-DEF)
                </p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {education.anatomical_explanation.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Limitations Warning */}
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-warning">Important Limitations</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {education.limitations_statement}
                </p>
              </div>
            </div>
          </div>

          {/* Questions for Doctor */}
          <div className="card-plush space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Questions for Your Doctor</h3>
                <p className="text-xs text-muted-foreground">
                  Bring these to your next appointment
                </p>
              </div>
            </div>
            <ul className="space-y-2">
              {education.questions_for_doctor.map((question, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm"
                >
                  <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-xs font-medium text-accent shrink-0">
                    {i + 1}
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-muted rounded-xl text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> {education.disclaimer}
          </div>

          {/* Continue to Breathwork */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">Next Step</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="card-plush card-breathwork">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Wind className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Get Your Breathwork Protocol</h3>
                  <p className="text-sm opacity-90 mt-1">
                    Now that you understand your symptoms better, get a personalized 7-day
                    SOMA Breath protocol to help manage them between doctor visits.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView("plan")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background rounded-xl font-medium btn-interactive"
            >
              <Wind className="w-5 h-5" />
              Create My Breathwork Plan
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
