"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";

function ymdLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Pazartesi başlangıçlı hafta (Mon-Sun)
function startOfWeekMonday(d) {
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun ... 6 Sat
    const diff = (day === 0 ? -6 : 1) - day; // Monday = 1
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

function sameYmd(a, b) {
    return ymdLocal(a) === ymdLocal(b);
}

function fmtDayLabel(d) {
    // Kısa ve net
    return d.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue...
}

function fmtDateLabel(d) {
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }); // 03 Jan
}

export default function WeeklyPaymentsCalendar() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]); // calendar events
    const [error, setError] = useState("");

    const today = useMemo(() => new Date(), []);
    const weekStart = useMemo(() => startOfWeekMonday(today), [today]);
    const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

    const range = useMemo(() => {
        const from = ymdLocal(weekDays[0]);
        const to = ymdLocal(weekDays[6]);
        return { from, to };
    }, [weekDays]);

    useEffect(() => {
        async function fetchWeek() {
            try {
                setLoading(true);
                setError("");
                const res = await api.get(`/calendar/events?from=${range.from}&to=${range.to}`);
                setItems(Array.isArray(res.data?.items) ? res.data.items : []);
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Bu haftanın takvim kayıtları alınamadı.");
                setItems([]);
            } finally {
                setLoading(false);
            }
        }

        fetchWeek();
    }, [range.from, range.to]);

    const byDay = useMemo(() => {
        // items: [{ id, title, date:'YYYY-MM-DD', subscriptionId, type, ... }]
        const map = new Map(); // ymd -> items[]
        for (const d of weekDays) map.set(ymdLocal(d), []);

        for (const e of items) {
            const key = String(e?.date || "").trim();
            if (!map.has(key)) continue;
            map.get(key).push(e);
        }

        // gün içi sıralama: aynı günse stable kalsın; istersen title’a göre sort edebilirsin
        return map;
    }, [items, weekDays]);

    return (
        <section className="rounded-3xl border border-jet p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">This Week</h2>
                    <p className="text-sm text-silver">
                        Payments / renewals for {range.from} → {range.to}
                    </p>
                </div>
            </div>

            {error ? (
                <p className="text-sm text-wrong border border-wrong/40 rounded-xl px-4 py-2">
                    {error}
                </p>
            ) : null}

            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {weekDays.map((d) => {
                        const key = ymdLocal(d);
                        const dayItems = byDay.get(key) || [];
                        const isToday = sameYmd(d, new Date());

                        return (
                            <div
                                key={key}
                                className={`rounded-2xl border border-jet p-3 space-y-2 ${isToday ? "bg-jet/40" : ""}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-silver">{fmtDayLabel(d)}</p>
                                        <p className="text-sm font-semibold">{fmtDateLabel(d)}</p>
                                    </div>
                                    <span className="text-xs text-silver">{dayItems.length}</span>
                                </div>

                                {dayItems.length === 0 ? (
                                    <p className="text-xs text-silver opacity-70">No payments</p>
                                ) : (
                                    <div className="space-y-2">
                                        {dayItems.map((e) => {
                                            const amountText =
                                                e?.amount != null && Number.isFinite(Number(e.amount))
                                                    ? `${Number(e.amount).toFixed(2)} ${e.currency || ""}`.trim()
                                                    : "";

                                            return (
                                                <button
                                                    key={e.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (e.subscriptionId) router.push(`/my-subscriptions/edit/${e.subscriptionId}`);
                                                    }}
                                                    className="w-full text-left rounded-xl border border-jet px-3 py-2 hover:bg-jet transition"
                                                    title="Open subscription"
                                                >
                                                    <p className="text-sm font-medium truncate">
                                                        {e.title || "Payment"}
                                                    </p>
                                                    <p className="text-xs text-silver truncate">
                                                        {e.type || "RENEWAL"}
                                                        {amountText ? ` • ${amountText}` : ""}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="absolute inset-0 bg-night/60 flex items-center justify-center rounded-3xl">
                        <LoadingSpinner />
                    </div>
                ) : null}
            </div>
        </section>
    );
}
