"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import LoadingSpinner from "@/components/loading-spinner";

export default function DashboardPage() {
    const { loading, user } = useRequireAuth();

    if (loading) {
        return (
            <main className="flex items-center justify-center h-[calc(100vh-80px)] text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="flex items-center justify-center mt-24 px-6 text-smoke">
            <div className="w-full md:w-2/3 xl:w-1/2 border-2 border-jet rounded-4xl p-8 space-y-4">
                <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
                <p className="text-silver text-sm">
                    Hoş geldin{" "}
                    <span className="font-medium">{user?.name}</span>{" "}
                    <span className="ml-2 text-info">{user?.email}</span>
                </p>
            </div>
        </main>
    );
}
