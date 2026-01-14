"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import api from "@/lib/api";

function validatePasswordChange(pw) {
    if (!pw.currentPassword || !pw.newPassword) {
        return "Current password and new password are required.";
    }
    if (String(pw.newPassword).length < 6) {
        return "New password must be at least 6 characters long.";
    }
    if (pw.newPassword !== pw.confirm) {
        return "New passwords do not match.";
    }
    return "";
}

export function useChangePassword() {
    const [saving, setSaving] = useState(false);

    const [pw, setPw] = useState({
        currentPassword: "",
        newPassword: "",
        confirm: "",
    });

    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const updateField = useCallback((field, value) => {
        setPw((prev) => ({ ...prev, [field]: value }));
    }, []);

    const submit = useCallback(async () => {
        const validationError = validatePasswordChange(pw);
        if (validationError) return { ok: false, message: validationError };

        setSaving(true);
        try {
            await api.patch("/settings/password", {
                currentPassword: pw.currentPassword,
                newPassword: pw.newPassword,
            });

            if (mountedRef.current) {
                setPw({ currentPassword: "", newPassword: "", confirm: "" });
            }

            return { ok: true, message: "Password updated successfully." };
        } catch (err) {
            console.error(err);
            return {
                ok: false,
                message: err?.response?.data?.message || "Failed to update password.",
            };
        } finally {
            if (mountedRef.current) setSaving(false);
        }
    }, [pw]);

    return {
        saving,
        pw,
        updateField,
        submit,
    };
}
