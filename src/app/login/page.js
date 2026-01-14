"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";
import BorderButton from "@/components/buttons/border-button";
import AuthCard from "@/components/auth/auth-card";
import AuthPageSpinner from "@/components/auth/auth-page-spinner";

import api from "@/lib/api";

const DEFAULT_ERROR_LOGIN = "An error occurred while signing in. Please try again.";

const DEFAULT_ERROR_FORGOT = "An error occurred while requesting a password reset.";

const DEFAULT_FORGOT_SUCCESS = "If this email is registered, a password reset link has been sent.";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const { loading: checking } = useRedirectIfAuthenticated();

    const [form, setForm] = useState({ email: "", password: "" });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotSubmitting, setForgotSubmitting] = useState(false);
    const [forgotMessage, setForgotMessage] = useState("");

    const resetMessages = useCallback(() => {
        setError("");
        setForgotMessage("");
    }, []);

    const handleChange = useCallback((field) => {
        return (e) => {
            const value = e.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));
        };
    }, []);

    const openForgotPassword = useCallback(() => {
        setForgotOpen(true);
        resetMessages();
    }, [resetMessages]);

    const backToLogin = useCallback(() => {
        setForgotOpen(false);
        resetMessages();
    }, [resetMessages]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            resetMessages();
            setSubmitting(true);

            try {
                await login(form.email, form.password);
                router.push("/dashboard");
            } catch (err) {
                console.error(err);
                const message = err?.response?.data?.message || DEFAULT_ERROR_LOGIN;
                setError(message);
            } finally {
                setSubmitting(false);
            }
        },
        [form.email, form.password, login, router, resetMessages]
    );

    const handleForgotSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            resetMessages();

            const email = String(form.email || "").trim();
            if (!email) {
                setError("Please enter your email address.");
                return;
            }

            setForgotSubmitting(true);
            try {
                const res = await api.post("/password/forgot", { email });
                setForgotMessage(res.data?.message || DEFAULT_FORGOT_SUCCESS);
            } catch (err) {
                console.error(err);
                const message = err?.response?.data?.message || DEFAULT_ERROR_FORGOT;
                setError(message);
            } finally {
                setForgotSubmitting(false);
            }
        },
        [form.email, resetMessages]
    );

    if (checking) return <AuthPageSpinner />;

    return (
        <AuthCard>
            {!forgotOpen ? (
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

                    {error && <p className="px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">{error}</p>}

                    <BorderButton
                        text={submitting ? "Signing in..." : "Login"}
                        className="w-full font-semibold"
                        disabled={submitting}
                    />

                    <div className="text-center text-sm font-light">
                        <button
                            type="button"
                            onClick={openForgotPassword}
                            className="underline underline-offset-2 text-warning"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <div className="text-center text-sm font-light">
                        <span className="text-sm text-silver font-light">
                            Don{"'"}t have an account?
                        </span>
                        <Link
                            href="/signup"
                            className="mx-2 underline underline-offset-2 text-info"
                        >
                            Sign Up
                        </Link>
                    </div>
                </form>
            ) : (
                <form className="space-y-5" onSubmit={handleForgotSubmit}>
                    <div className="space-y-2">
                        <p className="text-sm text-silver">
                            Enter your email address. If it is registered, we{"'"}ll send you a password reset link.
                        </p>

                        <FormInput
                            type="email"
                            placeholder="email"
                            value={form.email}
                            onChange={handleChange("email")}
                        />
                    </div>

                    {error && <p className="px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">{error}</p>}
                    {forgotMessage && <p className="px-4 py-2 rounded-xl border border-info/30 text-sm text-info">{forgotMessage}</p>}

                    <BorderButton
                        text={forgotSubmitting ? "Sending..." : "Send reset link"}
                        className="w-full font-semibold"
                        disabled={forgotSubmitting}
                    />

                    <div className="text-center text-sm font-light">
                        <button
                            type="button"
                            onClick={backToLogin}
                            className="underline underline-offset-2 text-silver hover:text-smoke"
                        >
                            Back to login
                        </button>
                    </div>
                </form>
            )}
        </AuthCard>
    );
}
