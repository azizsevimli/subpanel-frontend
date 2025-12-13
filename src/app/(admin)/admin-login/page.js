"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Logo from "@/components/logo";
import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";
import BorderButton from "@/components/buttons/border-button";
import LoadingSpinner from "@/components/loading-spinner";

export default function AdminLogin() {
    const router = useRouter();
    const { login, logout, user, isAuthenticated, initialLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ email: "", password: "" });

    useEffect(() => {
        if (initialLoading) return;
        if (isAuthenticated && user?.role === "ADMIN") {
            router.replace("/admin/dashboard");
        }
    }, [initialLoading, isAuthenticated, user, router]);

    function handleChange(field) {
        return (e) => {
            setForm((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));
        };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const loggedInUser = await login(form.email, form.password);

            if (loggedInUser.role !== "ADMIN") {
                setError("Bu hesabın admin yetkisi yok.");
                await logout();
                return;
            }

            router.push("/admin/dashboard");
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    if (initialLoading) {
        return (
            <main className="flex justify-center items-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="flex justify-center items-center mt-32 px-10 text-smoke">
            <div className="w-full md:w-1/2 xl:w-1/3 p-10 rounded-4xl border-2 border-jet space-y-7">
                <Logo admin={true} />
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <FormInput
                        type="email"
                        placeholder="email"
                        value={form.email}
                        onChange={handleChange("email")}
                    />
                    <PasswordInput
                        value={form.password}
                        onChange={handleChange("password")}
                    />
                    {error && (
                        <p className="text-sm text-wrong font-light">
                            {error}
                        </p>
                    )}
                    <BorderButton
                        text={submitting ? "Logging in..." : "Login"}
                        className="w-full font-semibold"
                        disabled={submitting}
                    />
                    <div className="text-center text-sm font-light">
                        <Link href="#" className="underline underline-offset-2 text-warning"> {/*TODO: Şifre yenileme linki tamamlanacak*/}
                            Forgot password?
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
