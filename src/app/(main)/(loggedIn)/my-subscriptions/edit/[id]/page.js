"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import Button from "@/components/buttons/button";
import PlatformFieldsSection from "@/components/main/subscription/platform-fields-section";
import SubscriptionDetailsSection from "@/components/main/subscription/subscription-details-section";

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
        planId: "",
        accountEmail: "",
        accountPhone: "",
        notes: "",
    });

    const hasActivePlans = useMemo(() => Array.isArray(plans) && plans.length > 0, [plans]);

    useEffect(() => {
        if (initialLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (!subscriptionId) {
            setError("Invalid subscription id.");
            setPageLoading(false);
            return;
        }

        let alive = true;

        async function fetchSubscription() {
            setPageLoading(true);
            setError("");

            try {
                const res = await api.get(`/subscriptions/${subscriptionId}`);

                if (!alive) return;

                const p = res.data?.platform || null;
                const values = Array.isArray(res.data?.values) ? res.data.values : [];
                const sub = res.data?.subscription || {};

                setPlatform(p);
                setPlans(Array.isArray(p?.plans) ? p.plans : []);
                setFields(Array.isArray(p?.fields) ? p.fields : []);

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
                if (!alive) return;
                setError(err?.response?.data?.message || "Failed to load subscription.");
            } finally {
                if (alive) setPageLoading(false);
            }
        }

        fetchSubscription();

        return () => {
            alive = false;
        };
    }, [initialLoading, isAuthenticated, router, subscriptionId]);

    const onChangeTrackingField = useCallback((field, value) => {
        setError("");
        setTracking((prev) => ({ ...prev, [field]: value }));
    }, []);

    const onChangeFieldValue = useCallback((fieldId, val) => {
        setError("");
        setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
    }, []);

    const validateBeforeSave = useCallback(() => {
        if (!tracking.startDate) return "Start Date is required.";

        if (hasActivePlans && !tracking.planId) {
            return "Please select a plan for this platform.";
        }

        const interval = Number(tracking.repeatInterval);
        if (!Number.isInteger(interval) || interval < 1) {
            return "Repeat interval must be at least 1.";
        }

        if (tracking.endDate) {
            const s = new Date(tracking.startDate);
            const e = new Date(tracking.endDate);
            if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e.getTime() < s.getTime()) {
                return "End Date cannot be earlier than Start Date.";
            }
        }

        for (const f of fields) {
            if (!f.required) continue;
            const v = fieldValues[f.id];
            if (isEmptyValue(v)) return `Required field: ${f.label}`;
        }

        return "";
    }, [tracking, hasActivePlans, fields, fieldValues]);

    const handleSave = useCallback(async () => {
        const vErr = validateBeforeSave();
        if (vErr) {
            setError(vErr);
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
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

            await api.patch(`/subscriptions/${subscriptionId}`, payload);
            router.replace("/my-subscriptions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    }, [validateBeforeSave, tracking, fields, fieldValues, subscriptionId, router]);

    const handleDelete = useCallback(async () => {
        const ok = window.confirm("Delete this subscription?");
        if (!ok) return;

        setSaving(true);
        setError("");

        try {
            await api.delete(`/subscriptions/${subscriptionId}`);
            router.replace("/my-subscriptions");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to delete subscription.");
        } finally {
            setSaving(false);
        }
    }, [subscriptionId, router]);

    if (initialLoading || pageLoading) return <FullPageSpinner />;

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <div className="flex items-center justify-start gap-4">
                    <Link
                        href="/my-subscriptions"
                        className="inline-flex items-center gap-2 text-silver hover:text-smoke"
                    >
                        <ArrowLeft size={18} />
                        Back to My Subscriptions
                    </Link>
                </div>

                {error ? (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">{error}</p>
                ) : null}

                <SubscriptionDetailsSection
                    selectedPlatformId={platform?.id || ""}
                    hasActivePlans={hasActivePlans}
                    plans={plans}
                    tracking={tracking}
                    onChangeTrackingField={onChangeTrackingField}
                />

                {platform?.id && fields.length > 0 ? (
                    <PlatformFieldsSection
                        selectedPlatformId={platform.id}
                        loadingFields={false}
                        fields={fields}
                        fieldValues={fieldValues}
                        onChangeFieldValue={onChangeFieldValue}
                    />
                ) : null}


                <div className="flex items-center justify-end gap-3">
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
        </main>
    );
}
