"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import api from "@/lib/api";

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function toProfileState(user) {
    const u = user || {};
    const email = u.email || "";

    return {
        profile: {
            name: u.name || "",
            surname: u.surname || "",
            email,
            currentPassword: "",
        },
        originalEmail: email,
    };
}

export function useSettingsProfile() {
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState({
        name: "",
        surname: "",
        email: "",
        currentPassword: "",
    });

    const [originalEmail, setOriginalEmail] = useState("");

    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const emailChanged = useMemo(() => {
        const now = normalizeEmail(profile.email);
        const orig = normalizeEmail(originalEmail);
        return Boolean(orig && now && now !== orig);
    }, [profile.email, originalEmail]);

    const fetchProfile = useCallback(async () => {
        setLoading(true);

        try {
            const res = await api.get("/settings/profile");
            const { profile: nextProfile, originalEmail: nextOriginal } = toProfileState(
                res.data?.user
            );

            if (!mountedRef.current) return { ok: true };

            setProfile(nextProfile);
            setOriginalEmail(nextOriginal);
            return { ok: true };
        } catch (err) {
            console.error(err);
            if (!mountedRef.current) return { ok: false };

            return {
                ok: false,
                message: err?.response?.data?.message || "Failed to load profile.",
            };
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const updateField = useCallback((field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    }, []);

    const saveProfile = useCallback(async () => {
        if (emailChanged && !profile.currentPassword) {
            return {
                ok: false,
                message: "Your current password is required to change your email address.",
            };
        }

        try {
            const payload = {
                name: profile.name,
                surname: profile.surname,
            };

            if (emailChanged) {
                payload.email = profile.email;
                payload.currentPassword = profile.currentPassword;
            }

            const res = await api.patch("/settings/profile", payload);
            const u = res.data?.user || {};

            if (!mountedRef.current) return { ok: true, message: "Profile updated successfully." };

            const updatedEmail = u.email || "";
            setOriginalEmail(updatedEmail);
            setProfile({
                name: u.name || "",
                surname: u.surname || "",
                email: updatedEmail,
                currentPassword: "",
            });

            return { ok: true, message: "Profile updated successfully." };
        } catch (err) {
            console.error(err);
            return {
                ok: false,
                message: err?.response?.data?.message || "Failed to update profile.",
            };
        }
    }, [emailChanged, profile]);

    return {
        loading,
        profile,
        originalEmail,
        emailChanged,
        setProfile,
        updateField,
        fetchProfile,
        saveProfile,
    };
}
