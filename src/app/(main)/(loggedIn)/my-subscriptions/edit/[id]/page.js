"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import Button from "@/components/buttons/button";

import PlatformFieldsSection from "@/components/main/subscription/platform-fields-section";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditSubscriptionPage() {
    const router = useRouter();
    const params = useParams();
    const subscriptionId = String(params?.id || "").trim();

    const { initialLoading, isAuthenticated } = useAuth();

    const [platform, setPlatform] = useState(null);
    const [plans, setPlans] = useState([]);
    const [fields, setFields] = useState([]);
    const [fieldValues, setFieldValues] = useState({});

    const [pageLoading, setPageLoading] = useState(true);
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

        // ✅ yeni standart alanlar
        planId: "",
        accountEmail: "",
        accountPhone: "",
        notes: "",
    });

    const hasActivePlans = Array.isArray(plans) && plans.length > 0;

    function setTrackingField(field) {
        return (val) => setTracking((p) => ({ ...p, [field]: val }));
    }

    useEffect(() => {
        if (initialLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (!subscriptionId) {
            setError("Geçersiz subscription id.");
            setPageLoading(false);
            return;
        }

        async function fetchSubscription() {
            try {
                setPageLoading(true);
                setError("");

                const res = await api.get(`/subscriptions/${subscriptionId}`);

                const p = res.data.platform;
                const values = res.data.values || [];
                const sub = res.data.subscription;

                setPlatform(p);
                setPlans(Array.isArray(p?.plans) ? p.plans : []);
                setFields(p?.fields || []);

                setTracking({
                    status: sub.status || "ACTIVE",
                    startDate: sub.startDate ? String(sub.startDate).slice(0, 10) : "",
                    endDate: sub.endDate ? String(sub.endDate).slice(0, 10) : "",
                    repeatUnit: sub.repeatUnit || "MONTH",
                    repeatInterval: String(sub.repeatInterval ?? 1),
                    amount: sub.amount ?? "",
                    currency: sub.currency || "TRY",

                    planId: sub.planId || "",
                    accountEmail: sub.accountEmail || "",
                    accountPhone: sub.accountPhone || "",
                    notes: sub.notes || "",
                });

                const map = {};
                for (const v of values) map[v.platformFieldId] = v.value;
                setFieldValues(map);
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Subscription alınırken hata oluştu.");
            } finally {
                setPageLoading(false);
            }
        }

        fetchSubscription();
    }, [initialLoading, isAuthenticated, router, subscriptionId]);

    function onChangeFieldValue(fieldId, val) {
        setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
    }

    function validateBeforeSave() {
        if (!tracking.startDate) return "Start Date zorunludur.";

        if (hasActivePlans && !tracking.planId) {
            return "Bu platformda plan seçimi zorunludur.";
        }

        const interval = Number(tracking.repeatInterval);
        if (!Number.isInteger(interval) || interval < 1) {
            return "Repeat interval en az 1 olmalıdır.";
        }

        if (tracking.endDate) {
            const s = new Date(tracking.startDate);
            const e = new Date(tracking.endDate);
            if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e.getTime() < s.getTime()) {
                return "End Date, Start Date'den küçük olamaz.";
            }
        }

        for (const f of fields) {
            if (!f.required) continue;
            const v = fieldValues[f.id];
            const empty =
                v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
            if (empty) return `Zorunlu alan: ${f.label}`;
        }

        return "";
    }

    async function handleSave() {
        const vErr = validateBeforeSave();
        if (vErr) {
            setError(vErr);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                status: tracking.status,
                startDate: tracking.startDate,
                endDate: tracking.endDate || null,

                repeatUnit: tracking.repeatUnit, // WEEK | MONTH | YEAR
                repeatInterval: Number(tracking.repeatInterval || 1),

                // ✅ decimal güvenliği
                amount: tracking.amount ? String(tracking.amount) : null,
                currency: tracking.currency ? String(tracking.currency).toUpperCase() : null,

                // ✅ yeni standart alanlar
                planId: tracking.planId ? String(tracking.planId) : null,
                accountEmail: tracking.accountEmail ? String(tracking.accountEmail) : null,
                accountPhone: tracking.accountPhone ? String(tracking.accountPhone) : null,
                notes: tracking.notes ? String(tracking.notes) : null,

                values: fields.map((f) => ({
                    platformFieldId: f.id,
                    value: fieldValues[f.id] ?? null,
                })),
            };

            await api.patch(`/subscriptions/${subscriptionId}`, payload);
            router.replace("/my-subscriptions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Kaydedilirken hata oluştu.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        const ok = window.confirm("Bu abonelik silinsin mi?");
        if (!ok) return;

        try {
            setSaving(true);
            setError("");
            await api.delete(`/subscriptions/${subscriptionId}`);
            router.replace("/my-subscriptions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Silme sırasında hata oluştu.");
        } finally {
            setSaving(false);
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
                <div className="flex items-start justify-between gap-4">
                    <Link
                        href="/my-subscriptions"
                        className="inline-flex items-center gap-2 text-silver hover:text-smoke"
                    >
                        <ArrowLeft size={18} />
                        Back to My Subscriptions
                    </Link>

                    <div className="flex items-center gap-3">
                        <BorderButton
                            text="Delete"
                            onClick={handleDelete}
                            disabled={saving}
                            className="border-wrong hover:bg-wrong text-wrong"
                            type="button"
                        />

                        <Button
                            text={saving ? "Saving..." : "Save"}
                            disabled={saving || fields.length === 0}
                            onClick={handleSave}
                            type="button"
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">{error}</p>
                )}

                <section className="rounded-3xl border border-jet p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Subscription Details</h2>

                    {/* ✅ Plan select */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm text-silver">
                            Plan {hasActivePlans ? <span className="text-wrong">*</span> : null}
                        </label>

                        <select
                            value={tracking.planId}
                            onChange={(e) => setTrackingField("planId")(e.target.value)}
                            className="w-full md:col-span-2 px-4 py-2 rounded-full border border-jet bg-night text-sm"
                            disabled={!hasActivePlans}
                        >
                            <option value="">{hasActivePlans ? "Select a plan..." : "No active plan"}</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-silver">Repeat Unit</p>
                            <select
                                value={tracking.repeatUnit}
                                onChange={(e) => setTrackingField("repeatUnit")(e.target.value)}
                                className="w-full px-4 py-2 rounded-full border border-jet bg-night text-sm"
                            >
                                <option value="WEEK">WEEK</option>
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
                            <p className="text-xs text-silver">1 = every unit</p>
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

                    {/* ✅ Account / Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-silver">Account Email</p>
                            <input
                                type="email"
                                value={tracking.accountEmail}
                                onChange={(e) => setTrackingField("accountEmail")(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-silver">Account Phone</p>
                            <input
                                type="text"
                                value={tracking.accountPhone}
                                onChange={(e) => setTrackingField("accountPhone")(e.target.value)}
                                placeholder="+90..."
                                className="w-full h-[35px] px-3 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-3">
                            <p className="text-sm text-silver">Notes</p>
                            <textarea
                                value={tracking.notes}
                                onChange={(e) => setTrackingField("notes")(e.target.value)}
                                placeholder="Optional notes..."
                                className="w-full min-h-[90px] px-3 py-2 rounded-[15px] border border-jet outline-none bg-smoke text-sm text-night"
                            />
                        </div>
                    </div>
                </section>

                <PlatformFieldsSection
                    selectedPlatformId={platform?.id || "x"}
                    loadingFields={false}
                    fields={fields}
                    fieldValues={fieldValues}
                    onChangeFieldValue={onChangeFieldValue}
                />
            </div>
        </main>
    );
}
