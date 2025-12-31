"use client";

import { useEffect, useMemo, useState } from "react";
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
    const [fields, setFields] = useState([]);
    const [fieldValues, setFieldValues] = useState({}); // { [fieldId]: value }

    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

                setPlatform(p);
                setFields(p?.fields || []);

                // values -> map
                const map = {};
                for (const v of values) {
                    map[v.platformFieldId] = v.value;
                }
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
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

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
