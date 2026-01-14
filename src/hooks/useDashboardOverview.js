"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/lib/api";

export function useDashboardOverview({ enabled }) {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const res = await api.get("/dashboard");

            if (!mountedRef.current) return { ok: true };

            setStats(res.data?.stats || null);
            setRecent(Array.isArray(res.data?.recentSubscriptions) ? res.data.recentSubscriptions : []);
            return { ok: true };
        } catch (err) {
            console.error(err);

            const message = err?.response?.data?.message || "Failed to load dashboard data.";
            if (!mountedRef.current) return { ok: false, message };

            setError(message);
            setStats(null);
            setRecent([]);
            return { ok: false, message };
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        fetchDashboard();
    }, [enabled, fetchDashboard]);

    const deleteSubscription = useCallback(
        async (id) => {
            try {
                setError("");

                // optimistic remove
                setRecent((prev) => prev.filter((x) => x.id !== id));

                await api.delete(`/subscriptions/${id}`);

                // keep stats consistent
                await fetchDashboard();
                return { ok: true };
            } catch (err) {
                console.error(err);

                const message = err?.response?.data?.message || "Failed to delete subscription.";
                if (mountedRef.current) setError(message);

                // fallback: refetch to restore UI
                await fetchDashboard();
                return { ok: false, message };
            }
        },
        [fetchDashboard]
    );

    return {
        stats,
        recent,
        loading,
        error,
        setError,
        refetch: fetchDashboard,
        deleteSubscription,
    };
}
