"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useSettingsProfile } from "@/hooks/useSettingsProfile";
import { useChangePassword } from "@/hooks/useChangePassword";

import LoadingSpinner from "@/components/loading-spinner";
import SettingsHeader from "@/components/main/settings/settings-header";
import ProfileSection from "@/components/main/settings/profile-section";
import PasswordSection from "@/components/main/settings/password-section";

function FullPageSpinner() {
    return (
        <main className="flex items-center justify-center h-screen text-smoke">
            <LoadingSpinner />
        </main>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const [message, setMessage] = useState({ type: "", text: "" });
    const clearMessage = useCallback(() => setMessage({ type: "", text: "" }), []);

    const {
        loading: profileLoading,
        profile,
        emailChanged,
        updateField: updateProfileField,
        fetchProfile,
        saveProfile,
    } = useSettingsProfile();

    const { saving: savingPw, pw, updateField: updatePwField, submit: submitPassword } =
        useChangePassword();

    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (initialLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        let alive = true;

        (async () => {
            clearMessage();
            const res = await fetchProfile();
            if (!alive) return;

            if (!res?.ok) {
                setMessage({ type: "error", text: res?.message || "Failed to load profile." });
            }
        })();

        return () => {
            alive = false;
        };
    }, [initialLoading, isAuthenticated, router, fetchProfile, clearMessage]);

    const handleProfileChange = useCallback(
        (field, value) => {
            clearMessage();
            updateProfileField(field, value);
        },
        [clearMessage, updateProfileField]
    );

    const handlePwChange = useCallback(
        (field, value) => {
            clearMessage();
            updatePwField(field, value);
        },
        [clearMessage, updatePwField]
    );

    const handleSaveProfile = useCallback(async () => {
        clearMessage();
        setSavingProfile(true);

        const res = await saveProfile();
        if (res?.ok) setMessage({ type: "success", text: res.message });
        else setMessage({ type: "error", text: res?.message || "Failed to update profile." });

        setSavingProfile(false);
    }, [clearMessage, saveProfile]);

    const handleChangePassword = useCallback(async () => {
        clearMessage();

        const res = await submitPassword();
        if (res?.ok) setMessage({ type: "success", text: res.message });
        else setMessage({ type: "error", text: res?.message || "Failed to update password." });
    }, [clearMessage, submitPassword]);

    if (initialLoading || profileLoading) return <FullPageSpinner />;
    if (!isAuthenticated) return <FullPageSpinner />;

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <SettingsHeader />

                {message.type === "error" ? (
                    <p className="px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">
                        {message.text}
                    </p>
                ) : null}

                {message.type === "success" ? (
                    <p className="px-4 py-2 rounded-xl border border-info/30 text-sm text-info">
                        {message.text}
                    </p>
                ) : null}

                <ProfileSection
                    profile={profile}
                    emailChanged={emailChanged}
                    saving={savingProfile}
                    onChange={handleProfileChange}
                    onSave={handleSaveProfile}
                />

                <PasswordSection
                    pw={pw}
                    saving={savingPw}
                    onChange={handlePwChange}
                    onSubmit={handleChangePassword}
                />
            </div>
        </main>
    );
}
