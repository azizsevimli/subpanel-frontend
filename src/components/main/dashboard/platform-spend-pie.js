"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENCY_OPTIONS = ["TRY", "EUR", "USD", "GBP"];
const DEFAULT_CURRENCY = "TRY";

const PLATFORM_COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#14b8a6",
    "#e11d48",
];

function getColorByPlatformName(name) {
    const key = String(name || "").trim();
    if (!key) return PLATFORM_COLORS[0];

    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    return PLATFORM_COLORS[Math.abs(hash) % PLATFORM_COLORS.length];
}

function normalizeGroups(groups) {
    let base = [];

    if (Array.isArray(groups)) {
        base = groups;
    }
    else if (groups && typeof groups === "object" && "currency" in groups) {
        base = [groups];
    }
    else if (groups && typeof groups === "object") {
        base = Object.values(groups);
    }

    return base
        .map((g) => ({
            currency: g?.currency,
            items: Array.isArray(g?.items) ? g.items : [],
        }))
        .filter((g) => g.currency);
}

export default function PlatformSpendPie({ groups }) {
    const normalizedGroups = useMemo(() => normalizeGroups(groups), [groups]);

    const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);

    const activeGroup = useMemo(() => {
        return normalizedGroups.find((g) => g.currency === selectedCurrency) || null;
    }, [normalizedGroups, selectedCurrency]);

    const items = useMemo(() => {
        const raw = activeGroup?.items || [];
        return raw.map((x) => {
            const n = Number(x?.amount);
            return {
                name: x?.name || x?.platformName || "Platform",
                value: Number.isFinite(n) ? n : 0,
            };
        });
    }, [activeGroup]);

    return (
        <div className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">This Month Spend by Platform</h2>
                <div className="flex items-center justify-between w-full gap-4">
                    <p className="text-sm text-silver">Currency</p>
                    <div className="w-full">
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                            <SelectTrigger className="w-full h-[35px] pl-3 rounded-[15px] border border-jet bg-smoke text-night text-sm">
                                <SelectValue placeholder="Select currency..." />
                            </SelectTrigger>
                            <SelectContent className="mt-10 rounded-[15px] border border-jet bg-night text-smoke">
                                {CURRENCY_OPTIONS.map((cur) => (
                                    <SelectItem key={cur} value={cur}>
                                        {cur}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {!activeGroup ? (
                <p className="text-sm text-silver border border-jet rounded-xl px-4 py-6 text-center">
                    No data for {selectedCurrency}.
                </p>
            ) : items.length === 0 ? (
                <p className="text-sm text-silver border border-jet rounded-xl px-4 py-6 text-center">
                    No spend items for {selectedCurrency}.
                </p>
            ) : (
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={items}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={95}
                                isAnimationActive={false}
                            >
                                {items.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={getColorByPlatformName(entry.name)}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#F5F5F5",
                                    color: "#0D0D0D",
                                    borderRadius: 12,
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
