"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

import LoadingSpinner from "@/components/loading-spinner";
import CalendarHeader from "@/components/main/calendar/calendar-header";
import CalendarShell from "@/components/main/calendar/calendar-shell";

function FullPageSpinner() {
    return (
        <main className="flex items-center justify-center h-screen text-smoke">
            <LoadingSpinner />
        </main>
    );
}

export default function CalendarPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const { fcEvents, loading, error, handleDatesSet } = useCalendarEvents();

    useEffect(() => {
        if (initialLoading) return;
        if (!isAuthenticated) router.replace("/login");
    }, [initialLoading, isAuthenticated, router]);

    const handleEventClick = useCallback(
        (info) => {
            const subscriptionId = info.event.extendedProps?.subscriptionId;
            if (subscriptionId) {
                router.push(`/my-subscriptions/edit/${subscriptionId}`);
            }
        },
        [router]
    );

    if (initialLoading) return <FullPageSpinner />;
    if (!isAuthenticated) return <FullPageSpinner />;

    return (
        <main className="text-smoke">
            <div className="space-y-6">
                <CalendarHeader />

                {error && <p className="px-4 py-2 rounded-xl border border-wrong/40 text-sm text-wrong">{error}</p>}

                <CalendarShell
                    events={fcEvents}
                    loading={loading}
                    onDatesSet={handleDatesSet}
                    onEventClick={handleEventClick}
                />
            </div>
        </main>
    );
}
