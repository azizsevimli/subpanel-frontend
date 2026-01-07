"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

export function usePlatformFields({ platformId, enabled }) {
    const [platform, setPlatform] = useState(null);
    const [plans, setPlans] = useState([]);
    const [fields, setFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [error, setError] = useState("");

    const fetchFields = useCallback(async () => {
        if (!platformId) {
            setPlatform(null);
            setPlans([]);
            setFields([]);
            return;
        }

        try {
            setLoadingFields(true);
            setError("");

            const res = await api.get(`/platforms/${platformId}/fields`);

            setPlatform(res.data?.platform || null);
            setPlans(Array.isArray(res.data?.plans) ? res.data.plans : []);
            setFields(Array.isArray(res.data?.fields) ? res.data.fields : []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Platform alanları alınırken hata oluştu.");
            setPlatform(null);
            setPlans([]);
            setFields([]);
        } finally {
            setLoadingFields(false);
        }
    }, [platformId]);

    useEffect(() => {
        if (!enabled) return;

        if (!platformId) {
            setPlatform(null);
            setPlans([]);
            setFields([]);
            return;
        }

        fetchFields();
    }, [enabled, platformId, fetchFields]);

    return { platform, plans, fields, loadingFields, error, refetch: fetchFields };
}
