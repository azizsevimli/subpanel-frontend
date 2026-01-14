"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import api from "@/lib/api";

function toYmdLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getInclusiveRangeFromDatesSet(arg) {
    const from = toYmdLocal(arg.start);

    const endMinusOne = new Date(arg.end);
    endMinusOne.setDate(endMinusOne.getDate() - 1);
    const to = toYmdLocal(endMinusOne);

    return { from, to };
}

export function useCalendarEvents() {
    const [items, setItems] = useState([]);
    const [range, setRange] = useState({ from: "", to: "" });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const lastFetchedKeyRef = useRef("");

    const fetchEvents = useCallback(async (from, to) => {
        const key = `${from}__${to}`;
        if (lastFetchedKeyRef.current === key) return;
        lastFetchedKeyRef.current = key;

        setLoading(true);
        setError("");

        try {
            const res = await api.get("/calendar/events", { params: { from, to } });
            setItems(res.data?.items || []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Unable to load calendar events.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDatesSet = useCallback(
        (arg) => {
            const { from, to } = getInclusiveRangeFromDatesSet(arg);
            setRange({ from, to });
            fetchEvents(from, to);
        },
        [fetchEvents]
    );

    const fcEvents = useMemo(() => {
        return items.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.date,
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

    return {
        items,
        range,
        fcEvents,
        loading,
        error,
        setError,
        handleDatesSet,
    };
}
