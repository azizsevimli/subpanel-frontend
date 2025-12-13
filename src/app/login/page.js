"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Link from "next/link";
import Logo from "@/components/logo";
import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";
import BorderButton from "@/components/buttons/border-button";
import LoadingSpinner from "@/components/loading-spinner";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const { loading: checking } = useRedirectIfAuthenticated();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ email: "", password: "" });

    if (checking) {
        return (
            <main className="flex justify-center items-center h-[calc(100vh-80px)] text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

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
            await login(form.email, form.password);
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex items-center justify-center mt-32 px-10 text-smoke">
            <div className="w-full md:w-1/2 xl:w-1/3 border-2 border-jet rounded-4xl space-y-7 p-10">
                <Logo />
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
                    {error && <p className="text-sm text-wrong font-light">{error}</p>}
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
                    <div className="text-center text-sm font-light">
                        <span className="text-sm text-silver font-light">
                            Don{"'"}t have an account?
                        </span>
                        <Link href="/signup" className="underline underline-offset-2 text-info mx-2">
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
