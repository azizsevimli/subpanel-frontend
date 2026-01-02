"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

export default function MonthlySpendChart({ series }) {
    // series: [{ currency, points:[{month, amount}] }]
    // Recharts tek dataset sever; currency'leri birleştiriyoruz:
    const months = series?.[0]?.points?.map((p) => p.month) || [];
    const rows = months.map((m) => {
        const row = { month: m };
        for (const s of series || []) {
            const found = s.points.find((x) => x.month === m);
            row[s.currency] = found ? Number(found.amount || 0) : 0;
        }
        return row;
    });

    return (
        <div className="rounded-3xl border border-jet p-6 space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Monthly Spend Trend</h2>
                <p className="text-sm text-silver">Last months (normalized monthly amount).</p>
            </div>

            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rows}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {(series || []).map((s) => (
                            <Line
                                key={s.currency}
                                type="monotone"
                                dataKey={s.currency}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
