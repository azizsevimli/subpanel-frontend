"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { toAbsoluteUrl } from "@/lib/uploads";

function formatValue(val) {
    if (val === null || val === undefined) return "-";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
}

export default function MySubscriptionsPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                setItems(res.data.items || []);
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Abonelikler alınırken hata oluştu.");
            } finally {
                setLoading(false);
            }
        }

        fetchSubs();
    }, [initialLoading, isAuthenticated, router]);

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
                        <p className="text-sm text-silver">Kayıtlı aboneliklerin.</p>
                    </div>

                    <BorderButton
                        text="Add Subscription"
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
                        {items.map((s) => (
                            <div key={s.id} className="rounded-3xl border border-jet p-6 space-y-4">
                                {/* Platform header */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {s.platform?.logoUrl ? (
                                            <Image
                                                src={toAbsoluteUrl(s.platform.logoUrl)}
                                                alt={s.platform.name}
                                                width={40}
                                                height={40}
                                                className="rounded-xl border border-jet object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl border border-jet" />
                                        )}

                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">{s.platform?.name}</p>
                                            <p className="text-xs text-silver truncate">
                                                {new Date(s.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-silver">
                                        {s.platform?.status}
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
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{f.label}</span>
                                                            <span className="text-xs text-silver">({f.type})</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-silver">
                                                        {formatValue(f.value)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Actions (şimdilik boş: edit/delete sonra ekleriz) */}
                                <div className="flex justify-end">
                                    <BorderButton
                                        text="Details"
                                        onClick={() => alert("Detay sayfasını sonra ekleyelim.")}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
