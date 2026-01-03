"use client";

import { useEffect, useMemo, useState } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import api from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import FormInput from "@/components/inputs/input";
import PasswordInput from "@/components/inputs/password";

export default function AdminSettingsPage() {
    const { loading: authLoading } = useRequireAdmin();

    const [meLoading, setMeLoading] = useState(true);
    const [me, setMe] = useState(null);

    const [profile, setProfile] = useState({
        name: "",
        surname: "",
        email: "",
        currentPassword: "", // ✅ email değişimi için
    });

    const [originalEmail, setOriginalEmail] = useState("");

    const [pwd, setPwd] = useState({
        currentPassword: "",
        newPassword: "",
        confirm: "",
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const emailChanged = useMemo(() => {
        const now = String(profile.email || "").trim().toLowerCase();
        const orig = String(originalEmail || "").trim().toLowerCase();
        return orig && now && now !== orig;
    }, [profile.email, originalEmail]);

    useEffect(() => {
        if (authLoading) return;

        async function fetchMe() {
            try {
                setMeLoading(true);
                setError("");
                const res = await api.get("/me");
                const u = res.data.user;

                setMe(u);
                setOriginalEmail(u?.email || "");

                setProfile({
                    name: u?.name || "",
                    surname: u?.surname || "",
                    email: u?.email || "",
                    currentPassword: "",
                });
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Kullanıcı bilgisi alınamadı.");
            } finally {
                setMeLoading(false);
            }
        }

        fetchMe();
    }, [authLoading]);

    function onProfileChange(field) {
        return (e) => {
            setSuccess("");
            setError("");
            setProfile((p) => ({ ...p, [field]: e.target.value }));
        };
    }

    function onPwdChange(field) {
        return (e) => {
            setSuccess("");
            setError("");
            setPwd((p) => ({ ...p, [field]: e.target.value }));
        };
    }

    async function saveProfile() {
        if (emailChanged && !profile.currentPassword) {
            setError("Email değiştirmek için mevcut şifre zorunludur.");
            return;
        }

        try {
            setSavingProfile(true);
            setError("");
            setSuccess("");

            const payload = {
                name: profile.name,
                surname: profile.surname,
            };

            if (emailChanged) {
                payload.email = profile.email;
                payload.currentPassword = profile.currentPassword;
            }

            const res = await api.patch("/admin/settings/profile", payload);

            const u = res.data.user;
            setMe(u);

            const updatedEmail = u?.email || "";
            setOriginalEmail(updatedEmail);

            setProfile((p) => ({
                ...p,
                email: updatedEmail,
                currentPassword: "",
            }));

            setSuccess("Profil güncellendi.");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Profil güncellenirken hata oluştu.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function changePassword() {
        if (!pwd.currentPassword || !pwd.newPassword) {
            setError("Mevcut şifre ve yeni şifre zorunludur.");
            return;
        }
        if (String(pwd.newPassword).length < 6) {
            setError("Yeni şifre en az 6 karakter olmalı.");
            return;
        }
        if (pwd.newPassword !== pwd.confirm) {
            setError("Yeni şifre ve doğrulama aynı olmalı.");
            return;
        }

        try {
            setSavingPwd(true);
            setError("");
            setSuccess("");

            await api.patch("/admin/settings/password", {
                currentPassword: pwd.currentPassword,
                newPassword: pwd.newPassword,
            });

            setPwd({ currentPassword: "", newPassword: "", confirm: "" });
            setSuccess("Şifre güncellendi.");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Şifre güncellenirken hata oluştu.");
        } finally {
            setSavingPwd(false);
        }
    }

    if (authLoading || meLoading) {
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
                    <h1 className="text-2xl font-semibold">Admin Settings</h1>
                    <p className="text-sm text-silver">Profil bilgileri ve şifre yönetimi.</p>
                    {me ? (
                        <p className="text-xs text-silver mt-1">
                            Logged in as: {me.email} ({me.role})
                        </p>
                    ) : null}
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-sm border border-info/40 rounded-xl px-4 py-2 text-info">
                        {success}
                    </p>
                )}

                {/* Profile */}
                <section className="rounded-3xl border border-jet p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Personal Info</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="text"
                            placeholder="name"
                            value={profile.name}
                            onChange={onProfileChange("name")}
                        />
                        <FormInput
                            type="text"
                            placeholder="surname"
                            value={profile.surname}
                            onChange={onProfileChange("surname")}
                        />
                    </div>

                    <FormInput
                        type="email"
                        placeholder="email"
                        value={profile.email}
                        onChange={onProfileChange("email")}
                    />

                    {/* ✅ Email değiştiyse şifre iste */}
                    {emailChanged && (
                        <div className="space-y-2">
                            <p className="text-xs text-silver">
                                Güvenlik için email değiştirmeden önce mevcut şifreni doğrulamalısın.
                            </p>
                            <PasswordInput
                                placeholder="current password (required for email change)"
                                value={profile.currentPassword}
                                onChange={onProfileChange("currentPassword")}
                            />
                        </div>
                    )}

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
                    <h2 className="text-lg font-semibold">Change Password</h2>

                    <PasswordInput
                        placeholder="current password"
                        value={pwd.currentPassword}
                        onChange={onPwdChange("currentPassword")}
                    />
                    <PasswordInput
                        placeholder="new password"
                        value={pwd.newPassword}
                        onChange={onPwdChange("newPassword")}
                    />
                    <PasswordInput
                        placeholder="confirm new password"
                        value={pwd.confirm}
                        onChange={onPwdChange("confirm")}
                    />

                    <div className="flex justify-end">
                        <BorderButton
                            text={savingPwd ? "Updating..." : "Update Password"}
                            disabled={savingPwd}
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
