"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { usePlatforms } from "@/hooks/usePlatforms";
import { usePlatformFields } from "@/hooks/usePlatformFields";

import api from "@/lib/api";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import PlatformSelectSection from "@/components/main/subscription/platform-select-section";
import PlatformFieldsSection from "@/components/main/subscription/platform-fields-section";
import SubscriptionDetailsSection from "@/components/main/subscription/subscription-details-section";
import BackSubscriptionButton from "@/components/main/subscription/back-subscription-button";

function FullPageSpinner() {
    return (
        <main className="flex items-center justify-center h-screen text-smoke">
            <LoadingSpinner />
        </main>
    );
}

function isEmptyValue(v) {
    return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

export default function AddSubscriptionPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const enabled = !initialLoading && isAuthenticated;

    const [selectedPlatformId, setSelectedPlatformId] = useState("");
    const [fieldValues, setFieldValues] = useState({});

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [tracking, setTracking] = useState({
        status: "ACTIVE",
        startDate: "",
        endDate: "",
        repeatUnit: "MONTH",
        repeatInterval: "1",
        amount: "",
        currency: "TRY",
        planId: "",
        accountEmail: "",
        accountPhone: "",
        notes: "",
    });

    const { platforms, loadingPlatforms, error: platformsError } = usePlatforms({ enabled });
    const { plans, fields, loadingFields, error: fieldsError } = usePlatformFields({
        platformId: selectedPlatformId,
        enabled,
    });

    const selectedPlatform = useMemo(() => {
        return platforms.find((p) => p.id === selectedPlatformId) || null;
    }, [platforms, selectedPlatformId]);

    const isSaveDisabled = !selectedPlatformId || saving || loadingFields;
    const saveText = saving
        ? "Saving..."
        : !selectedPlatformId
            ? "Select a platform to continue"
            : "Save";


    const hasActivePlans = Array.isArray(plans) && plans.length > 0;

    useEffect(() => {
        if (initialLoading) return;
        if (!isAuthenticated) router.replace("/login");
    }, [initialLoading, isAuthenticated, router]);

    useEffect(() => {
        setFieldValues({});
        setError("");
        setTracking((p) => ({ ...p, planId: "" }));
    }, [selectedPlatformId]);

    useEffect(() => {
        const msg = platformsError || fieldsError || "";
        if (msg) setError(msg);
    }, [platformsError, fieldsError]);

    const onChangeFieldValue = useCallback((fieldId, val) => {
        setError("");
        setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
    }, []);

    const onChangeTrackingField = useCallback((field, val) => {
        setError("");
        setTracking((prev) => ({ ...prev, [field]: val }));
    }, []);

    const validateBeforeSave = useCallback(() => {
        if (!selectedPlatformId) return "Please select a platform.";
        if (!tracking.startDate) return "Start Date is required.";

        if (hasActivePlans && !tracking.planId) {
            return "Please select a plan for this platform.";
        }

        const interval = Number(tracking.repeatInterval);
        if (!Number.isInteger(interval) || interval < 1) {
            return "Repeat interval must be at least 1.";
        }

        for (const f of fields) {
            if (!f.required) continue;
            const v = fieldValues[f.id];
            if (isEmptyValue(v)) return `Required field: ${f.label}`;
        }

        if (tracking.endDate) {
            const s = new Date(tracking.startDate);
            const e = new Date(tracking.endDate);
            if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e.getTime() < s.getTime()) {
                return "End Date cannot be earlier than Start Date.";
            }
        }

        return "";
    }, [selectedPlatformId, tracking, hasActivePlans, fields, fieldValues]);

    const handleSave = useCallback(async () => {
        const validationError = validateBeforeSave();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
                platformId: selectedPlatformId,

                status: tracking.status,
                startDate: tracking.startDate,
                endDate: tracking.endDate || null,

                repeatUnit: tracking.repeatUnit,
                repeatInterval: Number(tracking.repeatInterval || 1),

                amount: tracking.amount ? String(tracking.amount) : null,
                currency: tracking.currency ? String(tracking.currency).toUpperCase() : null,

                planId: tracking.planId ? String(tracking.planId) : null,
                accountEmail: tracking.accountEmail ? String(tracking.accountEmail) : null,
                accountPhone: tracking.accountPhone ? String(tracking.accountPhone) : null,
                notes: tracking.notes ? String(tracking.notes) : null,

                values: fields.map((f) => ({
                    platformFieldId: f.id,
                    value: fieldValues[f.id] ?? null,
                })),
            };

            await api.post("/subscriptions", payload);
            router.replace("/my-subscriptions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to save subscription.");
        } finally {
            setSaving(false);
        }
    }, [validateBeforeSave, selectedPlatformId, tracking, fields, fieldValues, router]);

    if (initialLoading) return <FullPageSpinner />;
    if (!isAuthenticated) return <FullPageSpinner />;
    if (loadingPlatforms) return <FullPageSpinner />;

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <div>
                    <BackSubscriptionButton className="mb-3" />
                    <h1 className="text-2xl font-semibold">Add Subscription</h1>
                    <p className="text-sm text-silver">Select a platform, fill in the details, and save.</p>
                </div>

                {error ? (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">{error}</p>
                ) : null}

                <PlatformSelectSection
                    platforms={platforms}
                    selectedPlatformId={selectedPlatformId}
                    onChange={(id) => setSelectedPlatformId(id)}
                    selectedPlatform={selectedPlatform}
                />

                {!selectedPlatformId ? (
                    null
                ) : (
                    <SubscriptionDetailsSection
                        selectedPlatformId={selectedPlatformId}
                        hasActivePlans={hasActivePlans}
                        plans={plans}
                        tracking={tracking}
                        onChangeTrackingField={onChangeTrackingField}
                    />
                )}

                {selectedPlatformId && (loadingFields || fields.length > 0) ? (
                    <PlatformFieldsSection
                        selectedPlatformId={selectedPlatformId}
                        loadingFields={loadingFields}
                        fields={fields}
                        fieldValues={fieldValues}
                        onChangeFieldValue={onChangeFieldValue}
                    />
                ) : null}

                <div className="flex justify-end">
                    <BorderButton
                        text={saveText}
                        disabled={isSaveDisabled}
                        onClick={handleSave}
                    />
                </div>
            </div>
        </main>
    );
}
