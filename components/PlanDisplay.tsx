"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNeuroSomaStore } from "@/lib/store";
import type { ActionPlan } from "@/lib/schemas";
import clsx from "clsx";

export function PlanDisplay() {
  const { setCurrentView, symptomDescription, education } = useNeuroSomaStore();
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function generatePlan() {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate event date (7 days from now for pain management)
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + 7);

        const response = await fetch("/api/create-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal: "pain_management",
            event_date: eventDate.toISOString().split("T")[0],
            obstacle: "chronic_pain",
            time_commitment: 15,
            experience: "some",
            symptom_description: symptomDescription,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to create plan");
          return;
        }

        setPlan(data.plan);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } catch (err) {
        setError("Connection error. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    generatePlan();
  }, [symptomDescription]);

  const toggleTask = (day: number, taskIndex: number) => {
    const key = `${day}-${taskIndex}`;
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-breathwork/10 rounded-full flex items-center justify-center mx-auto"
          >
            <Loader2 className="w-12 h-12 text-breathwork animate-spin" />
          </motion.div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <p className="text-lg font-medium">Creating your protocol...</p>
              <Sparkles className="w-5 h-5 text-breathwork animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">
              Matching techniques to your specific situation
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-sm"
        >
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-3">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={() => setCurrentView("symptoms")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-medium btn-interactive"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <motion.div
      key="plan"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 py-12"
    >
      <div className="container-wide">
        {/* Back button */}
        <button
          onClick={() => setCurrentView("education")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to education
        </button>

        {/* Confetti */}
        {showConfetti && (
          <div className="confetti-container" aria-hidden="true">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#10B981", "#0EA5E9", "#8B5CF6", "#F59E0B"][i % 4],
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-breathwork/10 rounded-full text-xs text-breathwork">
              Step 3 of 3 • Your Protocol
            </div>
            <h2 className="text-2xl font-bold">Your 7-Day Breathwork Plan 🎉</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Personalized SOMA Breath techniques matched to your needs.
              Practice daily for best results.
            </p>
          </div>

          {/* Core Technique Card */}
          <div className="card-plush card-lift space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-breathwork/10 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-breathwork" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-breathwork uppercase tracking-wider mb-1">
                  Your Core Practice
                </p>
                <h3 className="text-lg font-semibold leading-tight">
                  {plan.matched_technique?.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.matched_technique?.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {plan.matched_technique?.duration_min || 10} min/session
                </p>
              </div>
            </div>
          </div>

          {/* MedGemma Education Summary (if available) */}
          {education && (
            <div className="card-plush bg-education/5 border-education/20">
              <p className="text-xs font-medium text-education uppercase tracking-wider mb-2">
                From Your MedGemma Analysis
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {education.anatomical_explanation.substring(0, 200)}...
              </p>
            </div>
          )}

          {/* 7-Day Schedule */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
              Your 7-Day Protocol
            </h3>
            <div className="space-y-2">
              {plan.schedule?.map((day) => {
                if (!day?.day || !day?.tasks) return null;
                const dayCompleted = day.tasks.every((_, i) =>
                  completedTasks.has(`${day.day}-${i}`)
                );

                return (
                  <details
                    key={day.day}
                    className="card-plush group"
                    open={day.day === 1}
                  >
                    <summary className="flex items-center gap-3 cursor-pointer list-none">
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                          dayCompleted
                            ? "bg-breathwork text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {dayCompleted ? <CheckCircle2 className="w-4 h-4" /> : day.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={clsx(
                            "font-medium text-sm",
                            dayCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {day.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{day.focus}</p>
                      </div>
                    </summary>

                    <div className="mt-4 space-y-2 pl-11">
                      {day.tasks.map((task, taskIndex) => {
                        if (!task) return null;
                        const isCompleted = completedTasks.has(`${day.day}-${taskIndex}`);

                        return (
                          <button
                            key={taskIndex}
                            onClick={() => day.day && toggleTask(day.day, taskIndex)}
                            className={clsx(
                              "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                              isCompleted
                                ? "bg-muted/50"
                                : "bg-background border border-border hover:bg-muted/30"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-breathwork shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className={clsx(
                                  "text-sm",
                                  isCompleted && "line-through text-muted-foreground"
                                )}
                              >
                                {task.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {task.duration_min} min • {task.type}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          {/* Daily Rituals */}
          {plan.ritual && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
                Daily Rituals
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {plan.ritual.morning && (
                  <div className="card-plush">
                    <p className="text-xs font-medium text-breathwork uppercase tracking-wider mb-2">
                      Morning
                    </p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {plan.ritual.morning.map(
                        (item, i) =>
                          item && (
                            <li key={i} className="flex gap-2">
                              <span className="text-breathwork">•</span>
                              {item}
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                )}
                {plan.ritual.pre_event && (
                  <div className="card-plush">
                    <p className="text-xs font-medium text-breathwork uppercase tracking-wider mb-2">
                      When Symptoms Flare
                    </p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {plan.ritual.pre_event.map(
                        (item, i) =>
                          item && (
                            <li key={i} className="flex gap-2">
                              <span className="text-breathwork">•</span>
                              {item}
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                )}
                {plan.ritual.during_event && (
                  <div className="card-plush">
                    <p className="text-xs font-medium text-breathwork uppercase tracking-wider mb-2">
                      Emergency Protocol
                    </p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {plan.ritual.during_event.map(
                        (item, i) =>
                          item && (
                            <li key={i} className="flex gap-2">
                              <span className="text-breathwork">•</span>
                              {item}
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
