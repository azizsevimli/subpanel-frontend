"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

const CURRENCY_COLORS = {
    TRY: "#22C55E",
    USD: "#3B82F6",
    EUR: "#F59E0B",
    GBP: "#A855F7",
};

function getColorByCurrency(currency) {
    return CURRENCY_COLORS[currency] ?? "#A81211";
}

function formatMonthLabel(value) {
    if (!value || typeof value !== "string") return value;

    const [year, month] = value.split("-");
    if (!year || !month) return value;

    return `${month}/${year.slice(-2)}`;
}

export default function MonthlySpendChart({ series }) {
    const list = Array.isArray(series) ? series : [];

    const monthSet = new Set();
    for (const s of list) {
        for (const p of s?.points || []) monthSet.add(p.month);
    }
    const months = Array.from(monthSet);

    const lookup = {};
    for (const s of list) {
        const cur = s.currency;
        lookup[cur] = {};
        for (const p of s?.points || []) lookup[cur][p.month] = Number(p.amount || 0);
    }

    const rows = months.map((m) => {
        const row = { month: m };
        for (const s of list) row[s.currency] = lookup[s.currency]?.[m] ?? 0;
        return row;
    });

    return (
        <div className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Monthly Spend Trend</h2>
                <p className="text-sm text-silver">Last months (normalized monthly amount).</p>
            </div>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rows}>
                        <XAxis
                            dataKey="month"
                            tickFormatter={formatMonthLabel}
                        />
                        <YAxis />
                        <Tooltip
                            labelFormatter={formatMonthLabel}
                            contentStyle={{
                                backgroundColor: "#F5F5F5",
                                color: "#0D0D0D",
                                borderRadius: 12,
                            }}
                        />
                        <Legend />

                        {list.map((s) => (
                            <Line
                                key={s.currency}
                                type="linear"
                                dataKey={s.currency}
                                dot={false}
                                stroke={getColorByCurrency(s.currency)}
                                strokeWidth={2}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
