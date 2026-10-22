
import React from 'react';

export function CareerDevelopmentPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            STUDENT CAREER HUB
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Career Development & GATE Preparation
          </h1>

          <p className="mt-3 text-slate-600">
            Plan your career, prepare for GATE, and organize your weekly
            learning goals in one place.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">🚀</div>
            <h2 className="text-xl font-bold text-slate-900">
              Career Roadmaps
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Explore career paths, essential skills, and learning steps
              for your future profession.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">📚</div>
            <h2 className="text-xl font-bold text-slate-900">
              GATE Preparation
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Organize preparation for GATE CSE, ECE, DA, ME, and CE.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">📅</div>
            <h2 className="text-xl font-bold text-slate-900">
              Weekly Learning Planner
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Set study goals, plan your week, and track your progress.
            </p>
          </section>
        </div>

        <div className="mt-8 rounded-2xl bg-indigo-50 p-6">
          <h2 className="text-xl font-bold text-indigo-950">
            Your next goal starts here
          </h2>
          <p className="mt-2 text-slate-700">
            Choose a career roadmap or exam preparation plan to begin
            building your personalized learning journey.
          </p>
        </div>
      </div>
    </div>
  );
}
