"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/logo";
import PasswordInput from "@/components/inputs/password";
import BorderButton from "@/components/buttons/border-button";
import LoadingSpinner from "@/components/loading-spinner";
import api from "@/lib/api";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = useMemo(() => {
        return String(searchParams.get("token") || "").trim();
    }, [searchParams]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        // token kontrolü
        if (!token) {
            setError("Geçersiz veya eksik reset token.");
        }
        setLoading(false);
    }, [token]);

    function handleChange(field) {
        return (e) => {
            setForm((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };
    }

    function validate() {
        if (!token) return "Geçersiz veya eksik reset token.";
        if (!form.newPassword || form.newPassword.length < 6) {
            return "Şifre en az 6 karakter olmalı.";
        }
        if (form.newPassword !== form.confirmPassword) {
            return "Şifreler eşleşmiyor.";
        }
        return "";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const vErr = validate();
        if (vErr) {
            setError(vErr);
            return;
        }

        try {
            setSubmitting(true);

            // ✅ Backend: POST /api/password/reset
            await api.post("/password/reset", {
                token,
                newPassword: form.newPassword,
            });

            setSuccess("Şifren güncellendi. Giriş sayfasına yönlendiriliyorsun...");

            // kısa bir gecikmeyle login'e gönder (UX)
            setTimeout(() => {
                router.replace("/login");
            }, 900);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Şifre sıfırlama sırasında hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <main className="flex justify-center items-center h-[calc(100vh-80px)] text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="flex items-center justify-center mt-32 px-10 text-smoke">
            <div className="w-full md:w-1/2 xl:w-1/3 border-2 border-jet rounded-4xl space-y-7 p-10">
                <Logo />

                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">Reset Password</h1>
                    <p className="text-sm text-silver">
                        Yeni şifreni belirle. Link geçersizse yeni bir reset isteği oluştur.
                    </p>
                </div>

                {error ? (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                ) : null}

                {success ? (
                    <p className="text-sm text-info border border-info/30 rounded-xl px-4 py-2">
                        {success}
                    </p>
                ) : null}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <PasswordInput
                        placeholder="new password"
                        value={form.newPassword}
                        onChange={handleChange("newPassword")}
                    />

                    <PasswordInput
                        placeholder="confirm password"
                        value={form.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                    />

                    <BorderButton
                        text={submitting ? "Updating..." : "Update Password"}
                        className="w-full font-semibold"
                        disabled={submitting || !token}
                    />

                    <div className="text-center text-sm font-light">
                        <button
                            type="button"
                            onClick={() => router.replace("/login")}
                            className="underline underline-offset-2 text-silver hover:text-smoke"
                        >
                            Back to login
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
