"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useNeuroSomaStore } from "@/lib/store";

export function SymptomInput() {
  const {
    setCurrentView,
    symptomDescription,
    setSymptomDescription,
    setEducation,
    setEducationLoading,
  } = useNeuroSomaStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (symptomDescription.length < 20) {
      setError("Please describe your symptoms in more detail (at least 20 characters)");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setEducationLoading(true);

    try {
      const response = await fetch("/api/educate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: symptomDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.retryable) {
          setError("MedGemma is waking up. Please try again in 30 seconds.");
        } else {
          setError(data.error || "Failed to get education response");
        }
        setIsSubmitting(false);
        setEducationLoading(false);
        return;
      }

      setEducation(data.education);
      setCurrentView("education");
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setEducationLoading(false);
    }
  };

  return (
    <motion.div
      key="symptoms"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 py-12"
    >
      <div className="container-narrow">
        {/* Back button */}
        <button
          onClick={() => setCurrentView("hero")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-education/10 rounded-full text-xs text-education">
              Step 1 of 3
            </div>
            <h2 className="text-2xl font-bold">Describe Your Symptoms</h2>
            <p className="text-muted-foreground">
              Tell us what you're experiencing. MedGemma will help you understand
              potential anatomical connections and prepare questions for your doctor.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <label htmlFor="symptoms" className="sr-only">
              Describe your symptoms
            </label>
            <textarea
              id="symptoms"
              value={symptomDescription}
              onChange={(e) => setSymptomDescription(e.target.value)}
              placeholder="Example: I have a persistent dull ache in my lower back that sometimes shoots down my left leg. It gets worse when I sit for long periods and improves when I walk around..."
              className="w-full min-h-[200px] p-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-y"
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {symptomDescription.length < 20
                  ? `${20 - symptomDescription.length} more characters needed`
                  : "✓ Ready to submit"}
              </span>
              <span>{symptomDescription.length} characters</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl text-sm">
            <p className="font-medium text-warning">Important Limitations</p>
            <p className="text-muted-foreground mt-1">
              Symptom-to-anatomy mapping is only 30-35% predictive. This tool provides
              educational information only — it cannot diagnose or replace professional
              medical evaluation.
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || symptomDescription.length < 20}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background rounded-xl font-medium btn-interactive disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with MedGemma...
              </>
            ) : (
              <>
                Get Educational Insights
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
