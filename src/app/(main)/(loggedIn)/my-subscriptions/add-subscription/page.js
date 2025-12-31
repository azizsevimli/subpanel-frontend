"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";

import PlatformSelectSection from "@/components/main/subscription/platform-select-section";
import PlatformFieldsSection from "@/components/main/subscription/platform-fields-section";

import { usePlatforms } from "@/hooks/usePlatforms";
import { usePlatformFields } from "@/hooks/usePlatformFields";
import api from "@/lib/api";

export default function AddSubscriptionPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const [selectedPlatformId, setSelectedPlatformId] = useState("");
    const [fieldValues, setFieldValues] = useState({}); // { [platformFieldId]: value }
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const enabled = !initialLoading && isAuthenticated;

    const { platforms, loadingPlatforms, error: platformsError } = usePlatforms({ enabled });
    const { fields, loadingFields, error: fieldsError } = usePlatformFields({
        platformId: selectedPlatformId,
        enabled,
    });

    const selectedPlatform = useMemo(() => {
        return platforms.find((p) => p.id === selectedPlatformId) || null;
    }, [platforms, selectedPlatformId]);

    useEffect(() => {
        if (initialLoading) return;
        if (!isAuthenticated) router.replace("/login");
    }, [initialLoading, isAuthenticated, router]);

    // Platform değişince fieldValues resetle (eski platform değerleri karışmasın)
    useEffect(() => {
        setFieldValues({});
        setError("");
    }, [selectedPlatformId]);

    useEffect(() => {
        setError(platformsError || fieldsError || "");
    }, [platformsError, fieldsError]);

    function onChangeFieldValue(fieldId, val) {
        setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
    }

    function validateBeforeSave() {
        if (!selectedPlatformId) return "Lütfen bir platform seç.";
        // required alan kontrolü (UI tarafında hızlı kontrol)
        for (const f of fields) {
            if (!f.required) continue;
            const v = fieldValues[f.id];
            const empty =
                v === undefined ||
                v === null ||
                v === "" ||
                (Array.isArray(v) && v.length === 0);
            if (empty) return `Zorunlu alan: ${f.label}`;
        }
        return "";
    }

    async function handleSave() {
        const validationError = validateBeforeSave();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                platformId: selectedPlatformId,
                values: fields.map((f) => ({
                    platformFieldId: f.id,
                    value: fieldValues[f.id] ?? null,
                })),
            };

            await api.post("/subscriptions", payload);

            router.replace("/my-subscriptions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Kaydedilirken hata oluştu.");
        } finally {
            setSaving(false);
        }
    }

    if (initialLoading || (!initialLoading && !isAuthenticated)) {
        return (
            <main className="flex items-center justify-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    if (loadingPlatforms) {
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
                    <h1 className="text-2xl font-semibold">Add Subscription</h1>
                    <p className="text-sm text-silver">Platform seç ve alanları doldurup kaydet.</p>
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                <PlatformSelectSection
                    platforms={platforms}
                    selectedPlatformId={selectedPlatformId}
                    onChange={setSelectedPlatformId}
                    selectedPlatform={selectedPlatform}
                />

                <PlatformFieldsSection
                    selectedPlatformId={selectedPlatformId}
                    loadingFields={loadingFields}
                    fields={fields}
                    fieldValues={fieldValues}
                    onChangeFieldValue={onChangeFieldValue}
                />

                <div className="flex justify-end">
                    <BorderButton
                        text={saving ? "Saving..." : "Save"}
                        disabled={!selectedPlatformId || saving || loadingFields}
                        onClick={handleSave}
                    />
                </div>
            </div>
        </main>
    );
}
