"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { LayoutGrid, Plus, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { toAbsoluteUrl } from "@/lib/uploads";

import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";
import AddSubButton from "@/components/buttons/add-subscription";
import MonthlySpendChart from "@/components/main/dashboard/monthly-spend-chart";
import PlatformSpendPie from "@/components/main/dashboard/platform-spend-pie";
import RenewalsWeekBar from "@/components/main/dashboard/renewals-week-bar";
import WeeklyPaymentsCalendar from "@/components/main/dashboard/weekly-payments-calendar";

function FullPageSpinner() {
    return (
        <main className="flex items-center justify-center h-screen text-smoke">
            <LoadingSpinner />
        </main>
    );
}

function StatCard({ title, value, subtitle }) {
    return (
        <div className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-1">
            <p className="text-sm text-silver">{title}</p>
            <p className="text-2xl font-semibold whitespace-pre-line">{value}</p>
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

    useEffect(() => {
        if (initialLoading) return;
        if (!isAuthenticated) router.replace("/login");
    }, [initialLoading, isAuthenticated, router]);

    const enabled = !initialLoading && isAuthenticated;

    const {
        stats,
        recent,
        loading: overviewLoading,
        error: overviewError,
        deleteSubscription,
    } = useDashboardOverview({ enabled });

    const {
        data: charts,
        loading: chartsLoading,
        error: chartsError,
    } = useDashboardCharts({ enabled, months: 6 });

    const monthlySpendText = useMemo(() => {
        // 1) Backend tek currency döndürüyorsa onu kullan
        const amount = stats?.monthlySpend?.amount;
        const currency = stats?.monthlySpend?.currency;
        if (amount != null && Number.isFinite(Number(amount))) {
            return `${Number(amount).toFixed(2)} ${currency || ""}`.trim();
        }

        // 2) Fallback: charts'tan currency bazlı aylık harcama al
        const series = charts?.monthlySpendSeries;
        if (!Array.isArray(series) || series.length === 0) return "Not available yet";

        // her currency için en son ayın amount'unu göster
        const parts = series
            .map((s) => {
                const points = Array.isArray(s?.points) ? s.points : [];
                const last = points[points.length - 1];
                const n = Number(last?.amount);
                if (!Number.isFinite(n)) return null;
                return `${n.toFixed(2)} ${s.currency}`;
            })
            .filter(Boolean);

        return parts.length ? parts.join("\n") : "Not available yet";
    }, [stats, charts]);

    const handleDelete = useCallback(
        async (id) => {
            const ok = window.confirm("Delete this subscription?");
            if (!ok) return;
            await deleteSubscription(id);
        },
        [deleteSubscription]
    );

    if (initialLoading) return <FullPageSpinner />;
    if (!isAuthenticated) return <FullPageSpinner />;
    if (overviewLoading) return <FullPageSpinner />;

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:flex lg:items-start lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-silver">Subscriptions overview and quick actions.</p>
                    </div>

                    <div className="grid md:grid-cols-2 grid-cols-1 lg:flex lg:items-center gap-3">
                        <BorderButton
                            text="All Subscriptions"
                            icon={<LayoutGrid size={16} strokeWidth={3} />}
                            onClick={() => router.push("/my-subscriptions")}
                        />
                        <AddSubButton />
                    </div>
                </div>

                {overviewError ? (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {overviewError}
                    </p>
                ) : null}

                {chartsError ? (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {chartsError}
                    </p>
                ) : null}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard title="Total Subscriptions" value={stats?.totalSubscriptions ?? 0} />
                    <StatCard
                        title="Active Subscriptions"
                        value={stats?.activeSubscriptions ?? 0}
                        subtitle="Based on status"
                    />
                    <StatCard
                        title="Unique Platforms"
                        value={stats?.uniquePlatforms ?? 0}
                    />
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

                            <PlatformSpendPie groups={charts.spendByPlatform} />

                            <div className="xl:col-span-2">
                                <RenewalsWeekBar data={charts.renewalsThisMonth} />
                            </div>
                        </>
                    ) : null}
                </section>

                <WeeklyPaymentsCalendar />

                {/* Recent */}
                <section className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
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
                                    <div key={s.id} className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-3">
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
                                                    {" "}
                                                    • Amount: <span className="text-smoke">{amountText}</span>
                                                </>
                                            ) : null}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/my-subscriptions/edit/${s.id}`)}
                                                className="px-3 py-2 rounded-full border border-jet hover:bg-jet transition"
                                                title="Edit"
                                                type="button"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="px-3 py-2 rounded-full border border-jet hover:bg-jet transition text-wrong"
                                                title="Delete"
                                                type="button"
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
            </div>
        </main>
    );
}
