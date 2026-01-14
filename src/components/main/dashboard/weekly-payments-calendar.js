"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";

import LoadingSpinner from "@/components/loading-spinner";

function pad2(n) {
    return String(n).padStart(2, "0");
}

function ymdLocal(date) {
    const y = date.getFullYear();
    const m = pad2(date.getMonth() + 1);
    const d = pad2(date.getDate());
    return `${y}-${m}-${d}`;
}

function startOfWeekMonday(input) {
    const date = new Date(input);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function addDays(input, n) {
    const d = new Date(input);
    d.setDate(d.getDate() + n);
    d.setHours(0, 0, 0, 0);
    return d;
}

function sameYmd(a, b) {
    return ymdLocal(a) === ymdLocal(b);
}

function fmtDayLabel(d) {
    return d.toLocaleDateString(undefined, { weekday: "short" });
}

function fmtDateLabel(d) {
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function formatAmount(amount, currency) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "";
    return `${n.toFixed(2)} ${currency || ""}`.trim();
}

function isRenewalEvent(e) {
    return String(e?.type || "").toUpperCase() === "RENEWAL";
}

export default function WeeklyPaymentsCalendar() {
    const router = useRouter();

    const [today] = useState(() => new Date());
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");

    const weekStart = useMemo(() => startOfWeekMonday(today), [today]);
    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    const range = useMemo(() => {
        const from = ymdLocal(weekDays[0]);
        const to = ymdLocal(weekDays[6]);
        return { from, to };
    }, [weekDays]);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchWeek() {
            try {
                setLoading(true);
                setError("");

                const res = await api.get(
                    `/calendar/events?from=${range.from}&to=${range.to}`,
                    { signal: controller.signal }
                );

                const raw = Array.isArray(res.data?.items) ? res.data.items : [];
                const renewalsOnly = raw.filter(isRenewalEvent);

                setItems(renewalsOnly);
            } catch (err) {
                if (err?.name === "CanceledError" || err?.name === "AbortError") return;

                console.error(err);
                setError(err?.response?.data?.message || "Failed to load this week's payments.");
                setItems([]);
            } finally {
                setLoading(false);
            }
        }

        fetchWeek();
        return () => controller.abort();
    }, [range.from, range.to]);

    const byDay = useMemo(() => {
        const map = new Map();

        for (const d of weekDays) map.set(ymdLocal(d), []);

        for (const e of items) {
            const key = String(e?.date || "").trim();
            if (!map.has(key)) continue;
            map.get(key).push(e);
        }

        return map;
    }, [items, weekDays]);

    const totalThisWeek = items.length;

    return (
        <section className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">This Week</h2>
                    <p className="text-sm text-silver">
                        Payments / renewals for
                        <br />
                        <span className="font-semibold text-info">{range.from} → {range.to}</span>
                        <br />
                        Total: {totalThisWeek}
                    </p>
                </div>
            </div>

            {error ? (
                <p className="px-4 py-2 rounded-xl text-wrong border border-wrong/40 text-sm">
                    {error}
                </p>
            ) : null}

            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                    {weekDays.map((d) => {
                        const key = ymdLocal(d);
                        const dayItems = byDay.get(key) || [];
                        const isToday = sameYmd(d, today);

                        return (
                            <div
                                key={key}
                                className={[
                                    "px-2 py-3 md:p-3 rounded-xl md:rounded-2xl border border-jet space-y-2",
                                    isToday ? "bg-jet/40" : "",
                                ].join(" ")}
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
                                            const amountText = formatAmount(e?.amount, e?.currency);
                                            const title =
                                                e?.platform?.name
                                                    ? `${e.platform.name} • Payment`
                                                    : (e?.title || "Payment");

                                            const canOpen = Boolean(e?.subscriptionId);

                                            return (
                                                <button
                                                    key={e.id}
                                                    type="button"
                                                    disabled={!canOpen}
                                                    onClick={() => {
                                                        if (canOpen) {
                                                            router.push(`/my-subscriptions/edit/${e.subscriptionId}`);
                                                        }
                                                    }}
                                                    className={[
                                                        "w-full px-3 py-2 rounded-lg md:rounded-xl border border-jet bg-info transition text-left",
                                                        canOpen
                                                            ? "hover:bg-info/60 cursor-pointer"
                                                            : "opacity-60 cursor-not-allowed",
                                                    ].join(" ")}
                                                    title={canOpen ? "Open subscription" : "Subscription not found"}
                                                >
                                                    <p className="text-sm text-eerie font-medium truncate">{title}</p>
                                                    <p className="text-xs text-jet truncate">
                                                        {amountText ? amountText : "Amount not set"}
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
