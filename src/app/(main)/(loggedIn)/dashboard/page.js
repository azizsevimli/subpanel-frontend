"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import MonthlySpendChart from "@/components/main/dashboard/monthly-spend-chart";
import PlatformSpendPie from "@/components/main/dashboard/platform-spend-pie";
import RenewalsWeekBar from "@/components/main/dashboard/renewals-week-bar";
import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import Image from "next/image";
import { toAbsoluteUrl } from "@/lib/uploads";
import { LayoutGrid, Plus, Pencil, Trash2 } from "lucide-react";

function StatCard({ title, value, subtitle }) {
    return (
        <div className="rounded-3xl border border-jet p-6 space-y-1">
            <p className="text-sm text-silver">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {subtitle ? <p className="text-xs text-silver">{subtitle}</p> : null}
        </div>
    );
}

function safeDateText(v) {
    if (!v) return "";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
}

export default function UserDashboardPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const enabled = !initialLoading && isAuthenticated;
    const { data: charts, loading: chartsLoading, error: chartsError } = useDashboardCharts({ enabled, months: 6 });

    async function fetchDashboard() {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/dashboard");

            // ✅ Defensive: response shape değişse bile kırılma
            setStats(res.data?.stats || null);
            setRecent(Array.isArray(res.data?.recentSubscriptions) ? res.data.recentSubscriptions : []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Dashboard verisi alınırken hata oluştu.");
            setStats(null);
            setRecent([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLoading, isAuthenticated]);

    async function handleDelete(id) {
        const ok = window.confirm("Bu abonelik silinsin mi?");
        if (!ok) return;

        try {
            setError("");
            await api.delete(`/subscriptions/${id}`);
            setRecent((prev) => prev.filter((x) => x.id !== id));
            fetchDashboard();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Silme sırasında hata oluştu.");
        }
    }

    const monthlySpendText = useMemo(() => {
        const amount = stats?.monthlySpend?.amount;
        const currency = stats?.monthlySpend?.currency;
        if (amount == null) return "Not available yet";
        const n = Number(amount);
        if (!Number.isFinite(n)) return "Not available yet";
        return `${n.toFixed(2)} ${currency || ""}`.trim();
    }, [stats]);

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
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-silver">Subscriptions overview and quick actions.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <BorderButton
                            text="All Subscriptions"
                            icon={<LayoutGrid size={16} strokeWidth={3} />}
                            onClick={() => router.push("/my-subscriptions")}
                        />
                        <BorderButton
                            text="Add Subscription"
                            icon={<Plus size={16} strokeWidth={3} />}
                            onClick={() => router.push("/my-subscription/add-subscription")}
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                {
                    chartsError && (
                        <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                            {chartsError}
                        </p>
                    )
                }

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard title="Total Subscriptions" value={stats?.totalSubscriptions ?? 0} />
                    <StatCard
                        title="Active Subscriptions"
                        value={stats?.activeSubscriptions ?? 0}
                        subtitle="Based on status"
                    />
                    <StatCard title="Unique Platforms" value={stats?.uniquePlatforms ?? 0} />
                    <StatCard
                        title="Monthly Spend (estimate)"
                        value={monthlySpendText}
                        subtitle="Active subscriptions only"
                    />
                </div>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {chartsLoading ? (
                        <div className="flex justify-center py-10 xl:col-span-2">
                            <LoadingSpinner />
                        </div>
                    ) : charts ? (
                        <>
                            <MonthlySpendChart series={charts.monthlySpendSeries} />

                            {/* Pie: Multi currency ise ilk currency’yi göster (MVP) */}
                            <PlatformSpendPie byCurrency={charts.spendByPlatform?.[0]} />

                            <div className="xl:col-span-2">
                                <RenewalsWeekBar data={charts.renewalsThisMonth} />
                            </div>
                        </>
                    ) : null}
                </section>


                {/* Recent */}
                <section className="rounded-3xl border border-jet p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Subscriptions</h2>
                    </div>

                    {recent.length === 0 ? (
                        <p className="text-sm text-silver border border-jet rounded-xl px-4 py-6 text-center">
                            No subscriptions yet. Create your first one.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {recent.map((s) => {
                                const createdText = safeDateText(s?.createdAt);
                                const logo = s?.platform?.logoUrl ? toAbsoluteUrl(s.platform.logoUrl) : "";
                                const fieldsCount =
                                    (typeof s?.fieldsCount === "number" ? s.fieldsCount : null) ??
                                    (Array.isArray(s?.fields) ? s.fields.length : 0);

                                const amountOk = s?.amount != null && Number.isFinite(Number(s.amount));
                                const amountText = amountOk
                                    ? `${Number(s.amount).toFixed(2)} ${s.currency || ""}`.trim()
                                    : "";

                                return (
                                    <div key={s.id} className="rounded-3xl border border-jet p-5 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {logo ? (
                                                    <Image
                                                        src={logo}
                                                        alt={s?.platform?.name || "platform"}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-xl border border-jet object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl border border-jet" />
                                                )}

                                                <div className="min-w-0">
                                                    <p className="font-semibold truncate">{s?.platform?.name || "Platform"}</p>
                                                    <p className="text-xs text-silver truncate">
                                                        {createdText ? `Created: ${createdText}` : "Created: -"}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="text-xs text-silver">{s?.status || "-"}</span>
                                        </div>

                                        <div className="text-sm text-silver">
                                            Fields: <span className="text-smoke">{fieldsCount}</span>
                                            {amountText ? (
                                                <>
                                                    {" "}• Amount: <span className="text-smoke">{amountText}</span>
                                                </>
                                            ) : null}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/my-subscriptions/edit/${s.id}`)}
                                                className="px-3 py-2 rounded-full border border-jet hover:bg-jet transition"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="px-3 py-2 rounded-full border border-jet hover:bg-jet transition text-wrong"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Coming soon */}
                <section className="rounded-3xl border border-jet p-6">
                    <p className="text-sm text-silver">Coming soon</p>
                    <p className="mt-2 text-sm">
                        Calendar view, billing reminders, and monthly charts will appear here.
                    </p>
                </section>
            </div>
        </main>
    );
}
