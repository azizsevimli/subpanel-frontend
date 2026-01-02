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

    // ✅ Yeni sistem: billingDay yok, repeat var
    const [tracking, setTracking] = useState({
        status: "ACTIVE",
        startDate: "",
        endDate: "",
        repeatUnit: "MONTH",      // "MONTH" | "YEAR"
        repeatInterval: "1",      // string tutup payload'da number'a çevireceğiz
        amount: "",
        currency: "TRY",
    });

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

    function setTrackingField(field) {
        return (val) => setTracking((p) => ({ ...p, [field]: val }));
    }

    function validateBeforeSave() {
        if (!selectedPlatformId) return "Lütfen bir platform seç.";
        if (!tracking.startDate) return "Start Date zorunludur.";

        // repeatInterval kontrolü
        const interval = Number(tracking.repeatInterval);
        if (!Number.isInteger(interval) || interval < 1) {
            return "Repeat interval en az 1 olmalıdır.";
        }

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

        // EndDate opsiyonel ama startDate'ten küçükse uyaralım
        if (tracking.endDate) {
            const s = new Date(tracking.startDate);
            const e = new Date(tracking.endDate);
            if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e.getTime() < s.getTime()) {
                return "End Date, Start Date'den küçük olamaz.";
            }
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
                status: tracking.status,
                startDate: tracking.startDate, // ✅ zorunlu
                endDate: tracking.endDate || null,

                // ✅ yeni tekrar sistemi
                repeatUnit: tracking.repeatUnit, // "MONTH" | "YEAR"
                repeatInterval: Number(tracking.repeatInterval || 1),

                amount: tracking.amount ? Number(tracking.amount) : null,
                currency: tracking.currency ? String(tracking.currency).toUpperCase() : null,

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

                {/* ✅ Subscription Details */}
                <section className="rounded-3xl border border-jet p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Subscription Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm text-silver">Status</label>
                        <select
                            value={tracking.status}
                            onChange={(e) => setTrackingField("status")(e.target.value)}
                            className="w-full md:col-span-2 px-4 py-2 rounded-full border border-jet bg-night text-sm"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PAUSED">PAUSED</option>
                            <option value="CANCELED">CANCELED</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-silver">Start Date</p>
                            <input
                                type="date"
                                value={tracking.startDate}
                                onChange={(e) => setTrackingField("startDate")(e.target.value)}
                                className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                            <p className="text-xs text-silver">Required</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-silver">End Date</p>
                            <input
                                type="date"
                                value={tracking.endDate}
                                onChange={(e) => setTrackingField("endDate")(e.target.value)}
                                className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                            <p className="text-xs text-silver">Optional</p>
                        </div>
                    </div>

                    {/* ✅ Repeat settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-silver">Repeat Unit</p>
                            <select
                                value={tracking.repeatUnit}
                                onChange={(e) => setTrackingField("repeatUnit")(e.target.value)}
                                className="w-full px-4 py-2 rounded-full border border-jet bg-night text-sm"
                            >
                                <option value="MONTH">MONTH</option>
                                <option value="YEAR">YEAR</option>
                            </select>
                            <p className="text-xs text-silver">Required</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-silver">Repeat Interval</p>
                            <input
                                type="number"
                                min={1}
                                value={tracking.repeatInterval}
                                onChange={(e) => setTrackingField("repeatInterval")(e.target.value)}
                                placeholder="1"
                                className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                            <p className="text-xs text-silver">1 = every month/year</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-silver">Amount</p>
                            <input
                                type="number"
                                step="0.01"
                                value={tracking.amount}
                                onChange={(e) => setTrackingField("amount")(e.target.value)}
                                placeholder="0.00"
                                className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                            <p className="text-xs text-silver">Optional</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-silver">Currency</p>
                            <input
                                type="text"
                                value={tracking.currency}
                                onChange={(e) => setTrackingField("currency")(e.target.value)}
                                placeholder="TRY"
                                className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                            <p className="text-xs text-silver">Optional</p>
                        </div>

                        <div className="md:col-span-2 rounded-2xl border border-jet px-4 py-3 text-sm text-silver">
                            <span className="text-smoke font-medium">Rule:</span>{" "}
                            Renewal date = Start Date + (Repeat Unit × Interval). Period ends one day before renewal.
                        </div>
                    </div>
                </section>

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
