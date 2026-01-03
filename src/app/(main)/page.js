"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/loading-spinner";

function Landing() {
  return (
    <main className="text-smoke">
      {/* Buraya mevcut "/" landing içeriğini koy */}
      <div className="px-6 py-10">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="text-sm text-silver mt-2">
          Please login or sign up.
        </p>
      </div>
    </main>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { initialLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (initialLoading) return;

    if (isAuthenticated) {
      if (user?.role === "ADMIN") router.replace("/admin/dashboard");
      else router.replace("/dashboard");
    }
  }, [initialLoading, isAuthenticated, user, router]);

  // Auth durumu netleşene kadar spinner
  if (initialLoading) {
    return (
      <main className="flex items-center justify-center h-screen text-smoke">
        <LoadingSpinner />
      </main>
    );
  }

  // Girişliyse zaten redirect çalışır; burada boş ekran/spinner iyi olur
  if (isAuthenticated) {
    return (
      <main className="flex items-center justify-center h-screen text-smoke">
        <LoadingSpinner />
      </main>
    );
  }

  // Giriş yoksa landing
  return <Landing />;
}
