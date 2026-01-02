"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";

export default function SettingsPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [profile, setProfile] = useState({
        name: "",
        surname: "",
        email: "",
    });

    const [pw, setPw] = useState({
        currentPassword: "",
        newPassword: "",
        confirm: "",
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    useEffect(() => {
        if (initialLoading) return;
        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        async function fetchProfile() {
            try {
                setPageLoading(true);
                setError("");
                const res = await api.get("/settings/profile");
                const u = res.data.user;

                setProfile({
                    name: u?.name || "",
                    surname: u?.surname || "",
                    email: u?.email || "",
                });
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Profil alınırken hata oluştu.");
            } finally {
                setPageLoading(false);
            }
        }

        fetchProfile();
    }, [initialLoading, isAuthenticated, router]);

    function setProfileField(field) {
        return (e) => setProfile((p) => ({ ...p, [field]: e.target.value }));
    }

    function setPwField(field) {
        return (e) => setPw((p) => ({ ...p, [field]: e.target.value }));
    }

    async function saveProfile() {
        try {
            setSavingProfile(true);
            setError("");
            setSuccess("");

            const payload = {
                name: profile.name,
                surname: profile.surname,
                email: profile.email,
            };

            const res = await api.patch("/settings/profile", payload);

            const u = res.data.user;
            setProfile({
                name: u?.name || "",
                surname: u?.surname || "",
                email: u?.email || "",
            });

            setSuccess("Profil güncellendi.");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Profil güncellenirken hata oluştu.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function changePassword() {
        if (!pw.currentPassword || !pw.newPassword) {
            setError("Mevcut şifre ve yeni şifre zorunludur.");
            return;
        }
        if (pw.newPassword.length < 6) {
            setError("Yeni şifre en az 6 karakter olmalı.");
            return;
        }
        if (pw.newPassword !== pw.confirm) {
            setError("Yeni şifreler eşleşmiyor.");
            return;
        }

        try {
            setSavingPw(true);
            setError("");
            setSuccess("");

            await api.patch("/settings/password", {
                currentPassword: pw.currentPassword,
                newPassword: pw.newPassword,
            });

            setPw({ currentPassword: "", newPassword: "", confirm: "" });
            setSuccess("Şifre güncellendi.");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Şifre güncellenirken hata oluştu.");
        } finally {
            setSavingPw(false);
        }
    }

    if (initialLoading || pageLoading) {
        return (
            <main className="flex items-center justify-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Settings</h1>
                    <p className="text-sm text-silver">Profil ve şifre ayarlarını yönet.</p>
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-sm text-info border border-info/30 rounded-xl px-4 py-2">
                        {success}
                    </p>
                )}

                {/* Profile */}
                <section className="rounded-3xl border border-jet p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Profile</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="text"
                            placeholder="name"
                            value={profile.name}
                            onChange={setProfileField("name")}
                        />
                        <FormInput
                            type="text"
                            placeholder="surname"
                            value={profile.surname}
                            onChange={setProfileField("surname")}
                        />
                    </div>

                    <FormInput
                        type="email"
                        placeholder="email"
                        value={profile.email}
                        onChange={setProfileField("email")}
                    />

                    <div className="flex justify-end">
                        <BorderButton
                            text={savingProfile ? "Saving..." : "Save Profile"}
                            disabled={savingProfile}
                            onClick={saveProfile}
                        />
                    </div>
                </section>

                {/* Password */}
                <section className="rounded-3xl border border-jet p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Password</h2>

                    <PasswordInput
                        placeholder="current password"
                        value={pw.currentPassword}
                        onChange={setPwField("currentPassword")}
                    />
                    <PasswordInput
                        placeholder="new password"
                        value={pw.newPassword}
                        onChange={setPwField("newPassword")}
                    />
                    <PasswordInput
                        placeholder="confirm new password"
                        value={pw.confirm}
                        onChange={setPwField("confirm")}
                    />

                    <div className="flex justify-end">
                        <BorderButton
                            text={savingPw ? "Updating..." : "Update Password"}
                            disabled={savingPw}
                            onClick={changePassword}
                        />
                    </div>

                    <p className="text-xs text-silver">
                        Güvenlik için yeni şifren en az 6 karakter olmalı.
                    </p>
                </section>
            </div>
        </main>
    );
}
