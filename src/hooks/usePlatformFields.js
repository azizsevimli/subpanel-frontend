"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import api from "@/lib/api";

export function usePlatformFields({ platformId, enabled }) {
    const [platform, setPlatform] = useState(null);
    const [plans, setPlans] = useState([]);
    const [fields, setFields] = useState([]);

    const [loadingFields, setLoadingFields] = useState(false);
    const [error, setError] = useState("");

    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const reset = useCallback(() => {
        if (!mountedRef.current) return;
        setPlatform(null);
        setPlans([]);
        setFields([]);
    }, []);

    const fetchFields = useCallback(async () => {
        if (!platformId) {
            reset();
            return { ok: true };
        }

        setLoadingFields(true);
        setError("");

        try {
            const res = await api.get(`/platforms/${platformId}/fields`);

            if (!mountedRef.current) return { ok: true };

            setPlatform(res.data?.platform || null);
            setPlans(Array.isArray(res.data?.plans) ? res.data.plans : []);
            setFields(Array.isArray(res.data?.fields) ? res.data.fields : []);

            return { ok: true };
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || "Failed to load platform fields.";

            if (mountedRef.current) {
                setError(message);
                reset();
            }

            return { ok: false, message };
        } finally {
            if (mountedRef.current) setLoadingFields(false);
        }
    }, [platformId, reset]);

    useEffect(() => {
        if (!enabled) return;

        if (!platformId) {
            reset();
            return;
        }

        fetchFields();
    }, [enabled, platformId, fetchFields, reset]);

    return { platform, plans, fields, loadingFields, error, refetch: fetchFields };
}
