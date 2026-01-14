"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import api from "@/lib/api";

export function usePlatforms({ enabled }) {
    const [platforms, setPlatforms] = useState([]);
    const [loadingPlatforms, setLoadingPlatforms] = useState(false);
    const [error, setError] = useState("");

    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchPlatforms = useCallback(async () => {
        setLoadingPlatforms(true);
        setError("");

        try {
            const res = await api.get("/platforms");
            const items = Array.isArray(res.data?.items) ? res.data.items : [];

            if (!mountedRef.current) return { ok: true };
            setPlatforms(items);
            return { ok: true };
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || "Failed to load platforms.";

            if (mountedRef.current) setError(message);
            return { ok: false, message };
        } finally {
            if (mountedRef.current) setLoadingPlatforms(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        fetchPlatforms();
    }, [enabled, fetchPlatforms]);

    return { platforms, loadingPlatforms, error, refetch: fetchPlatforms };
}
