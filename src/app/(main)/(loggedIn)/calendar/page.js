"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import BorderButton from "@/components/buttons/border-button";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

function ymdLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function CalendarPage() {
    const router = useRouter();
    const { initialLoading, isAuthenticated } = useAuth();

    const [eventsLoading, setEventsLoading] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [range, setRange] = useState({ from: "", to: "" });

    // ✅ aynı range için tekrar fetch’i engellemek için
    const lastFetchedRef = useRef({ from: "", to: "" });

    const fetchEvents = useCallback(async (from, to) => {
        // aynı aralık için tekrar istek atma
        if (lastFetchedRef.current.from === from && lastFetchedRef.current.to === to) return;

        lastFetchedRef.current = { from, to };

        try {
            setEventsLoading(true);
            setError("");

            const res = await api.get(
                `/calendar/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
            );

            setItems(res.data.items || []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Takvim eventleri alınamadı.");
            setItems([]);
        } finally {
            setEventsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialLoading) return;

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }
    }, [initialLoading, isAuthenticated, router]);

    const fcEvents = useMemo(() => {
        return items.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.date, // YYYY-MM-DD (all-day)
            allDay: true,
            extendedProps: {
                subscriptionId: e.subscriptionId,
                type: e.type,
                status: e.status,
                amount: e.amount,
                currency: e.currency,
                platform: e.platform,
            },
        }));
    }, [items]);

    if (initialLoading) {
        return (
            <main className="flex items-center justify-center h-screen text-smoke">
                <LoadingSpinner />
            </main>
        );
    }

    if (!isAuthenticated) {
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
                        <h1 className="text-2xl font-semibold">Calendar</h1>
                        <p className="text-sm text-silver">Subscription start & renewal dates.</p>
                        {range.from && range.to ? (
                            <p className="text-xs text-silver mt-1">
                                Range: {range.from} → {range.to}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                        <BorderButton
                            text="Add Subscription"
                            onClick={() => router.push("/my-subscription/add-subscription")}
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                <section className="rounded-3xl border border-jet p-4 md:p-6 relative">
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        height="auto"
                        events={fcEvents}
                        datesSet={(arg) => {
                            // arg.end exclusive → son günü 1 gün geri al
                            const from = ymdLocal(arg.start);
                            const endMinusOne = new Date(arg.end);
                            endMinusOne.setDate(endMinusOne.getDate() - 1);
                            const to = ymdLocal(endMinusOne);

                            setRange({ from, to });
                            fetchEvents(from, to);
                        }}
                        eventClick={(info) => {
                            const subscriptionId = info.event.extendedProps?.subscriptionId;
                            if (subscriptionId) router.push(`/my-subscriptions/edit/${subscriptionId}`);
                        }}
                        eventDidMount={(info) => {
                            const p = info.event.extendedProps;
                            const amountText =
                                p?.amount != null
                                    ? ` • ${Number(p.amount).toFixed(2)} ${p.currency || ""}`
                                    : "";
                            info.el.title = `${info.event.title}${amountText}`;
                        }}
                    />

                    {eventsLoading && (
                        <div className="absolute inset-0 bg-night/60 flex items-center justify-center rounded-3xl">
                            <LoadingSpinner />
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
