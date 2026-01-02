"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Tooltip,
    Legend,
} from "recharts";

export default function PlatformSpendPie({ byCurrency }) {
    // byCurrency: { currency, items:[{name, amount}] }
    const items = (byCurrency?.items || []).map((x) => ({
        name: x.name,
        value: Number(x.amount || 0),
    }));

    return (
        <div className="rounded-3xl border border-jet p-6 space-y-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">This Month Spend by Platform</h2>
                    <p className="text-sm text-silver">
                        {byCurrency?.currency ? `Currency: ${byCurrency.currency}` : "Currency mixed"}
                    </p>
                </div>
            </div>

            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={items} dataKey="value" nameKey="name" outerRadius={95} />
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
