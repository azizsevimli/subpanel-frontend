"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import Button from "@/components/buttons/button";
import Image from "next/image";
import { toAbsoluteUrl } from "@/lib/uploads";
import { Plus } from "lucide-react";

function formatValue(val) {
    if (val === null || val === undefined) return "-";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
}

function safeDateText(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
}

function safeYmd(v) {
    if (!v) return "-";
    const s = String(v);
    return s.length >= 10 ? s.slice(0, 10) : s;
}

export default function MySubscriptionsPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function handleDelete(id) {
        const ok = window.confirm("Bu abonelik silinsin mi?");
        if (!ok) return;

        try {
            setError("");
            await api.delete(`/subscriptions/${id}`);
            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Silme sırasında hata oluştu.");
        }
    }

    useEffect(() => {
        if (initialLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        async function fetchSubs() {
            try {
                setLoading(true);
                setError("");
                const res = await api.get("/subscriptions");
                setItems(Array.isArray(res.data.items) ? res.data.items : []);
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Abonelikler alınırken hata oluştu.");
                setItems([]);
            } finally {
                setLoading(false);
            }
        }

        fetchSubs();
    }, [initialLoading, isAuthenticated, router]);

    const totalText = useMemo(() => `${items.length} subscription`, [items.length]);

    if (initialLoading || (!initialLoading && !isAuthenticated)) {
        return (
            <main className="flex items-center justify-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    if (loading) {
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
                    <div>
                        <h1 className="text-2xl font-semibold">My Subscriptions</h1>
                        <p className="text-sm text-silver">Kayıtlı aboneliklerin. ({totalText})</p>
                    </div>

                    <BorderButton
                        text="Add Subscription"
                        icon={<Plus size={16} strokeWidth={3} />}
                        onClick={() => router.push("/my-subscriptions/add-subscription")}
                    />
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                {items.length === 0 ? (
                    <p className="text-sm text-silver border border-jet rounded-xl px-4 py-6 text-center">
                        Henüz abonelik yok.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {items.map((s) => {
                            const logoSrc = s.platform?.logoUrl ? toAbsoluteUrl(s.platform.logoUrl) : "";
                            const createdText = safeDateText(s.createdAt);

                            // ✅ repeat bilgisi (yeni sistem)
                            const startDateText = safeYmd(s.startDate);
                            const repeatUnit = s.repeatUnit || "-";
                            const repeatInterval = s.repeatInterval ?? "-";

                            // amount/currency (opsiyonel)
                            const amountOk = s.amount != null && Number.isFinite(Number(s.amount));
                            const amountText = amountOk
                                ? `${Number(s.amount).toFixed(2)} ${s.currency || ""}`.trim()
                                : "-";

                            return (
                                <div key={s.id} className="rounded-3xl border border-jet p-6 space-y-4">
                                    {/* Platform header */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {logoSrc ? (
                                                <Image
                                                    src={logoSrc}
                                                    alt={s.platform?.name || "platform"}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-xl border border-jet object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl border border-jet" />
                                            )}

                                            <div className="min-w-0">
                                                <p className="font-semibold truncate">{s.platform?.name || "Platform"}</p>
                                                <p className="text-xs text-silver truncate">Created: {createdText}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-silver">Status</p>
                                            <p className="text-sm">{s.status || "-"}</p>
                                        </div>
                                    </div>

                                    {/* ✅ Subscription summary (yeni sistem) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div className="rounded-2xl border border-jet px-4 py-3">
                                            <p className="text-xs text-silver">Start Date</p>
                                            <p className="mt-1">{startDateText}</p>
                                        </div>

                                        <div className="rounded-2xl border border-jet px-4 py-3">
                                            <p className="text-xs text-silver">Repeat</p>
                                            <p className="mt-1">
                                                Every {repeatInterval} {repeatUnit}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-jet px-4 py-3">
                                            <p className="text-xs text-silver">Amount</p>
                                            <p className="mt-1">{amountText}</p>
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <div className="border border-jet rounded-2xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-jet text-silver">
                                                <tr>
                                                    <th className="text-left px-4 py-2">Field</th>
                                                    <th className="text-left px-4 py-2">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(s.fields || []).map((f) => (
                                                    <tr key={f.fieldId} className="border-t border-jet">
                                                        <td className="px-4 py-2">
                                                            <span className="font-medium">{f.label}</span>
                                                        </td>
                                                        <td className="px-4 py-2 text-silver">{formatValue(f.value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <BorderButton
                                            text="Delete"
                                            onClick={() => handleDelete(s.id)}
                                            className="border-wrong hover:bg-wrong text-wrong"
                                        />
                                        <Button
                                            text="Edit"
                                            onClick={() => router.push(`/my-subscriptions/edit/${s.id}`)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
