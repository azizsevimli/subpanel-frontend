"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

export function usePlatforms({ enabled }) {
    const [platforms, setPlatforms] = useState([]);
    const [loadingPlatforms, setLoadingPlatforms] = useState(true);
    const [error, setError] = useState("");

    const fetchPlatforms = useCallback(async () => {
        try {
            setLoadingPlatforms(true);
            setError("");
            const res = await api.get("/platforms");
            setPlatforms(res.data.items || []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Platformlar alınırken hata oluştu.");
        } finally {
            setLoadingPlatforms(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        fetchPlatforms();
    }, [enabled, fetchPlatforms]);

    return { platforms, loadingPlatforms, error, refetch: fetchPlatforms };
}
