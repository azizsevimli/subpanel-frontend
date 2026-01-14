"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/lib/api";

export function useMySubscriptions({ enabled }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const res = await api.get("/subscriptions");
            const list = Array.isArray(res.data?.items) ? res.data.items : [];

            if (!mountedRef.current) return { ok: true };
            setItems(list);
            return { ok: true };
        } catch (err) {
            console.error(err);

            if (!mountedRef.current) return { ok: false };

            setItems([]);
            const message = err?.response?.data?.message || "Failed to load subscriptions.";
            setError(message);
            return { ok: false, message };
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        fetchItems();
    }, [enabled, fetchItems]);

    const removeItemOptimistic = useCallback((id) => {
        setItems((prev) => prev.filter((x) => x.id !== id));
    }, []);

    const deleteSubscription = useCallback(async (id) => {
        try {
            setError("");
            await api.delete(`/subscriptions/${id}`);
            if (mountedRef.current) removeItemOptimistic(id);
            return { ok: true };
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || "Failed to delete subscription.";
            if (mountedRef.current) setError(message);
            return { ok: false, message };
        }
    }, [removeItemOptimistic]);

    return {
        items,
        loading,
        error,
        setError,
        refetch: fetchItems,
        deleteSubscription,
    };
}
