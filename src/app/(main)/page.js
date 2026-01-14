"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import Button from "@/components/buttons/button";

function FullPageSpinner() {
  return (
    <main className="flex items-center justify-center h-screen text-smoke">
      <LoadingSpinner />
    </main>
  );
}

function getRedirectPath(user) {
  if (user?.role === "ADMIN") return "/admin/dashboard";
  return "/dashboard";
}

function FeatureCard({ title, text }) {
  return (
    <div className="p-6 rounded-3xl border border-jet space-y-2 hover:text-warning transition-colors">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-silver">{text}</p>
    </div>
  );
}

function Landing({ onLogin, onSignup }) {
  const features = useMemo(
    () => [
      {
        title: "Spot Unused Subscriptions",
        text: "Identify subscriptions you're paying for but not actually using.",
      },
      {
        title: "Track Renewals",
        text: "Never get surprised by payment or renewal dates again.",
      },
      {
        title: "Clarify Monthly Spending",
        text: "Quickly see the total cost impact of your active subscriptions.",
      },
    ],
    []
  );

  const steps = useMemo(
    () => [
      { title: "1) Choose a platform", text: "Pick the service you use from the list." },
      { title: "2) Enter the details", text: "Add price and billing cycle information." },
      { title: "3) Keep track", text: "Stay in control with the dashboard and calendar." },
    ],
    []
  );

  return (
    <main className="text-smoke">
      <div className="space-y-20">
        {/* HERO */}
        <section className="text-center max-w-full mx-auto mt-24 px-6 space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Track your subscriptions <br />
            <span className="text-info">in one place</span>
          </h1>

          <p className="text-lg text-silver">
            Renewal dates and what you pay — all crystal clear.
            Easily monitor everything from your calendar and dashboard.
          </p>
        </section>

        {/* FEATURES */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} title={f.title} text={f.text} />
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <h2 className="text-2xl font-semibold">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {steps.map((s) => (
              <div key={s.title} className="space-y-2">
                <p className="text-info font-semibold">{s.title}</p>
                <p className="text-sm text-silver">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-24 px-6 space-y-6">
          <h2 className="text-2xl font-semibold">Ready to get started?</h2>

          <div className="flex justify-center gap-4">
            <Button text="Create Account" onClick={onSignup} />
            <BorderButton text="Login" onClick={onLogin} />
          </div>

          <p className="text-xs text-silver">
            After signing up, you can add your first subscription in under a minute.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { initialLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (initialLoading) return;
    if (!isAuthenticated) return;

    router.replace(getRedirectPath(user));
  }, [initialLoading, isAuthenticated, user, router]);

  if (initialLoading) return <FullPageSpinner />;

  if (isAuthenticated) return <FullPageSpinner />;

  return (
    <Landing
      onLogin={() => router.push("/login")}
      onSignup={() => router.push("/signup")}
    />
  );
}
