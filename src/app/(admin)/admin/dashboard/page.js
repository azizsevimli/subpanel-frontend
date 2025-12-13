"use client";

import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import LoadingSpinner from "@/components/loading-spinner";

export default function AdminPanelPage() {
    const { loading } = useRequireAdmin();

    if (loading) {
        return (
            <main className="flex items-center justify-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main className="flex justify-center items-center">
            <h1>Admin Dashboard</h1>
        </main>
    );
}