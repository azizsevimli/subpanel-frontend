"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import Link from "next/link";
import Logo from "@/components/logo";
import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";
import BorderButton from "@/components/buttons/border-button";
import LoadingSpinner from "@/components/loading-spinner";

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

    if (checking) {
        return (
            <main className="flex items-center justify-center h-[calc(100vh-80px)] text-smoke">
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
            await signup({
                name: form.name,
                surname: form.surname,
                email: form.email,
                password: form.password,
            });

            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex justify-center items-center mt-32 px-5 text-smoke">
            <div className="w-full md:w-1/2 xl:w-1/3 p-10 rounded-4xl border-2 border-jet space-y-7">
                <Logo />
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FormInput
                                type="text"
                                placeholder="name"
                                value={form.name}
                                onChange={handleChange("name")}
                            />
                        </div>
                        <div>
                            <FormInput
                                type="text"
                                placeholder="surname"
                                value={form.surname}
                                onChange={handleChange("surname")}
                            />
                        </div>
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
                    {error && (
                        <p className="text-sm text-wrong font-light">
                            {error}
                        </p>
                    )}
                    <div className="flex justify-start items-start font-light text-sm text-center text-silver">
                        <Info size={16} className="mt-1 mr-1" />
                        <div className="">
                            <span>By signing up, you agree to our</span>{" "}
                            <Link href="#" className="underline underline-offset-2 text-info mx-1">
                                Terms
                            </Link>{","}
                            <Link href="#" className="underline underline-offset-2 text-info mx-1">
                                Data Policy
                            </Link>{" and "}
                            <Link href="#" className="underline underline-offset-2 text-info mx-1">
                                Cookies Policy
                            </Link>{"."}
                        </div>
                    </div>
                    <BorderButton
                        text={submitting ? "Signing Up..." : "Sign Up"}
                        className="w-full font-semibold"
                        disabled={submitting}
                    />
                    <div className="text-center text-sm font-light">
                        <span className="text-sm text-silver font-light">
                            Have an account?
                        </span>
                        <Link href="/login" className="underline underline-offset-2 text-info mx-2">
                            Login
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
