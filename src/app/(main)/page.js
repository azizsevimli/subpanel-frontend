"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import Button from "@/components/buttons/button";

function Feature({ title, text }) {
  return (
    <div className="rounded-3xl border border-jet p-6 space-y-2">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-silver">{text}</p>
    </div>
  );
}

function Landing({ onLogin, onSignup }) {
  return (
    <main className="text-smoke">
      <div className="space-y-20">

        {/* HERO */}
        <section className="text-center max-w-3xl mx-auto mt-24 px-6 space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Aboneliklerini <br />
            <span className="text-info">tek yerden</span> takip et
          </h1>

          <p className="text-lg text-silver">
            Ne zaman yenileniyor, ne kadar ödüyorsun — hepsi net.
            Takvim ve dashboard üzerinden kolayca kontrol et.
          </p>
        </section>

        {/* FEATURES */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Feature
              title="Unutulan Abonelikleri Gör"
              text="Kullanmadan para ödediğin abonelikleri fark et."
            />
            <Feature
              title="Yenilenmeleri Takip Et"
              text="Ödeme/yenilenme günleri sürpriz olmasın."
            />
            <Feature
              title="Aylık Harcamayı Netleştir"
              text="Aktif aboneliklerin toplam etkisini hızlıca gör."
            />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <h2 className="text-2xl font-semibold">Nasıl çalışır?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <p className="text-info font-semibold">1) Platformu seç</p>
              <p className="text-sm text-silver">
                Kullandığın servisi listeden seç.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-info font-semibold">2) Bilgileri gir</p>
              <p className="text-sm text-silver">
                Ücret ve tekrar bilgilerini ekle.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-info font-semibold">3) Takip et</p>
              <p className="text-sm text-silver">
                Dashboard + takvim ile kontrol sende olsun.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-24 px-6 space-y-6">
          <h2 className="text-2xl font-semibold">
            Hemen başlamaya hazır mısın?
          </h2>

          <div className="flex justify-center gap-4">
            <Button text="Create Account" onClick={onSignup} />
            <BorderButton text="Login" onClick={onLogin} />
          </div>

          <p className="text-xs text-silver">
            Kayıt olduktan sonra ilk aboneliğini 1 dakikadan kısa sürede ekleyebilirsin.
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

  // Girişliyse redirect çalışır; burada kısa spinner uygundur
  if (isAuthenticated) {
    return (
      <main className="flex items-center justify-center h-screen text-smoke">
        <LoadingSpinner />
      </main>
    );
  }

  // Giriş yoksa landing
  return (
    <Landing
      onLogin={() => router.push("/login")}
      onSignup={() => router.push("/signup")}
    />
  );
}
