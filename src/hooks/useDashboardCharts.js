"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export function useDashboardCharts({ enabled, months = 6 }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!enabled) return;

        async function run() {
            try {
                setLoading(true);
                setError("");
                const res = await api.get(`/dashboard/charts?months=${months}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError(err?.response?.data?.message || "Chart verileri alınamadı.");
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        run();
    }, [enabled, months]);

    return { data, loading, error };
}
