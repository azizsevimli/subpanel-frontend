"use client";

import { useEffect, useState } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import api from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import { Users, Shield, LayoutGrid, CreditCard } from "lucide-react";

function StatCard({ title, value, icon }) {
    return (
        <div className="rounded-3xl border border-jet p-6 flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-silver">{title}</p>
                <p className="text-2xl font-semibold">{value}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl border border-jet flex items-center justify-center">
                {icon}
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const { loading: authLoading, user: adminUser } = useRequireAdmin();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) return;

        async function fetchStats() {
            try {
                setLoading(true);
                setError("");
                const res = await api.get("/admin/stats");
                setStats(res.data.stats);
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Dashboard verisi alınırken hata oluştu.");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [authLoading]);

    if (authLoading || loading) {
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
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-silver">
                        Admin: {adminUser?.name} ({adminUser?.email})
                    </p>
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            <StatCard title="Total Users" value={stats.totalUsers} icon={<Users size={18} />} />
                            <StatCard title="Total Admins" value={stats.totalAdmins} icon={<Shield size={18} />} />
                            <StatCard title="Total Platforms" value={stats.totalPlatforms} icon={<LayoutGrid size={18} />} />
                            <StatCard title="Total Subscriptions" value={stats.totalSubscriptions} icon={<CreditCard size={18} />} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-3xl border border-jet p-6">
                                <p className="text-sm text-silver">Platforms Status</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-info/20 text-info text-sm">
                                        Active: {stats.activePlatforms}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-jet text-silver text-sm">
                                        Inactive: {stats.inactivePlatforms}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-jet p-6">
                                <p className="text-sm text-silver">Next Ideas</p>
                                <ul className="mt-3 text-sm text-silver list-disc pl-5 space-y-1">
                                    <li>Last 7 days: new users / subscriptions</li>
                                    <li>Top platforms by subscription count</li>
                                    <li>Growth trend chart</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
