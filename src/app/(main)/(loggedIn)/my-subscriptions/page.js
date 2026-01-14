"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useMySubscriptions } from "@/hooks/useMySubscriptions";

import LoadingSpinner from "@/components/loading-spinner";
import SubscriptionsHeader from "@/components/main/subscription/subscriptions-header";
import SubscriptionCard from "@/components/main/subscription/subscription-card";

function FullPageSpinner() {
    return (
        <main className="flex items-center justify-center h-screen text-smoke">
            <LoadingSpinner />
        </main>
    );
}

export default function MySubscriptionsPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (initialLoading) return;
        if (!isAuthenticated) router.replace("/login");
    }, [initialLoading, isAuthenticated, router]);

    const enabled = !initialLoading && isAuthenticated;

    const { items, loading, error, deleteSubscription } = useMySubscriptions({
        enabled,
    });

    const handleDelete = useCallback(
        async (id) => {
            const ok = window.confirm("Delete this subscription?");
            if (!ok) return;
            await deleteSubscription(id);
        },
        [deleteSubscription]
    );

    const handleEdit = useCallback(
        (id) => {
            router.push(`/my-subscriptions/edit/${id}`);
        },
        [router]
    );

    if (initialLoading) return <FullPageSpinner />;
    if (!isAuthenticated) return <FullPageSpinner />;
    if (loading) return <FullPageSpinner />;

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <SubscriptionsHeader total={items.length} />

                {error ? (
                    <p className="px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">
                        {error}
                    </p>
                ) : null}

                {items.length === 0 ? (
                    <p className="px-4 py-6 rounded-xl border border-jet text-sm text-silver text-center">
                        You don{"'"}t have any subscriptions yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {items.map((s) => (
                            <SubscriptionCard
                                key={s.id}
                                sub={s}
                                onEdit={() => handleEdit(s.id)}
                                onDelete={() => handleDelete(s.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
