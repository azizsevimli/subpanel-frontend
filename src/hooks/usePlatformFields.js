"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

export function usePlatformFields({ platformId, enabled }) {
    const [fields, setFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [error, setError] = useState("");

    const fetchFields = useCallback(async () => {
        if (!platformId) {
            setFields([]);
            return;
        }

        try {
            setLoadingFields(true);
            setError("");
            const res = await api.get(`/platforms/${platformId}/fields`);
            setFields(res.data.fields || []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Platform alanları alınırken hata oluştu.");
            setFields([]);
        } finally {
            setLoadingFields(false);
        }
    }, [platformId]);

    useEffect(() => {
        if (!enabled) return;
        if (!platformId) {
            setFields([]);
            return;
        }
        fetchFields();
    }, [enabled, platformId, fetchFields]);

    return { fields, loadingFields, error, refetch: fetchFields };
}
