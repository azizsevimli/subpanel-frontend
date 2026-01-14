"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PasswordInput from "@/components/inputs/password";
import BorderButton from "@/components/buttons/border-button";
import AuthCard from "@/components/auth/auth-card";
import AuthPageSpinner from "@/components/auth/auth-page-spinner";

import api from "@/lib/api";

const DEFAULT_ERROR_RESET = "An error occurred while resetting your password.";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTimeoutRef = useRef(null);

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
        if (!token) setError("Invalid or missing reset token.");
        setLoading(false);

        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, [token]);

    const handleChange = useCallback((field) => {
        return (e) => {
            const value = e.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));
        };
    }, []);

    const validate = useCallback(() => {
        if (!token) return "Invalid or missing reset token.";
        if (!form.newPassword || form.newPassword.length < 6) return "Password must be at least 6 characters long.";
        if (form.newPassword !== form.confirmPassword) return "Passwords do not match.";
        return "";
    }, [form.confirmPassword, form.newPassword, token]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError("");
            setSuccess("");

            const vErr = validate();
            if (vErr) {
                setError(vErr);
                return;
            }

            setSubmitting(true);
            try {
                await api.post("/password/reset", {
                    token,
                    newPassword: form.newPassword,
                });

                setSuccess("Your password has been updated. Redirecting you to the login page...");

                redirectTimeoutRef.current = setTimeout(() => { router.replace("/login"); }, 1000);
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || DEFAULT_ERROR_RESET);
            } finally {
                setSubmitting(false);
            }
        },
        [form.newPassword, router, token, validate]
    );

    if (loading) return <AuthPageSpinner />;

    return (
        <AuthCard>
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Reset Password</h1>
                <p className="text-sm text-silver">
                    Set your new password. If the link is invalid, request a new reset link.
                </p>
            </div>

            {error && <p className="px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">{error}</p>}

            {success && <p className="px-4 py-2 rounded-xl border border-info/30 text-sm text-info">{success}</p>}

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
        </AuthCard>
    );
}
