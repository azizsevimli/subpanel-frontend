"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";
import BorderButton from "@/components/buttons/border-button";
import AuthCard from "@/components/auth/auth-card";
import AuthPageSpinner from "@/components/auth/auth-page-spinner";

const DEFAULT_ERROR_SIGNUP = "An error occurred while creating your account. Please try again.";

export default function Signup() {
    const router = useRouter();
    const { signup } = useAuth();
    const { loading: checking } = useRedirectIfAuthenticated();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        surname: "",
        email: "",
        password: "",
    });

    const handleChange = useCallback((field) => {
        return (e) => {
            const value = e.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));
        };
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError("");
            setSubmitting(true);

            try {
                await signup({
                    name: form.name,
                    surname: form.surname,
                    email: form.email,
                    password: form.password,
                });

                router.push("/dashboard");
            } catch (err) {
                console.error(err);
                const message = err?.response?.data?.message || DEFAULT_ERROR_SIGNUP;
                setError(message);
            } finally {
                setSubmitting(false);
            }
        },
        [form, router, signup]
    );

    if (checking) return <AuthPageSpinner />;

    return (
        <AuthCard>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-3">
                    <FormInput
                        type="text"
                        placeholder="name"
                        value={form.name}
                        onChange={handleChange("name")}
                    />
                    <FormInput
                        type="text"
                        placeholder="surname"
                        value={form.surname}
                        onChange={handleChange("surname")}
                    />
                </div>

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

                <div className="flex justify-start items-start font-light text-sm text-center text-silver">
                    <Info size={16} className="mt-1 mr-1" />
                    <div>
                        <span>By signing up, you agree to our</span>{" "}
                        <Link href="#" className="underline underline-offset-2 text-info mx-1">
                            Terms
                        </Link>
                        {","}
                        <Link href="#" className="underline underline-offset-2 text-info mx-1">
                            Data Policy
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="underline underline-offset-2 text-info mx-1">
                            Cookies Policy
                        </Link>
                        {"."}
                    </div>
                </div>

                <BorderButton
                    text={submitting ? "Signing up..." : "Sign Up"}
                    className="w-full font-semibold"
                    disabled={submitting}
                />

                <div className="text-center text-sm font-light">
                    <span className="text-sm text-silver font-light">Already have an account?</span>
                    <Link href="/login" className="underline underline-offset-2 text-info mx-2">
                        Login
                    </Link>
                </div>
            </form>
        </AuthCard>
    );
}
