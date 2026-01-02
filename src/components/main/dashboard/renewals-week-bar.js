"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

export default function RenewalsWeekBar({ data }) {
    // data: [{week, count}]
    const rows = (data || []).map((x) => ({
        week: `W${x.week}`,
        count: Number(x.count || 0),
    }));

    return (
        <div className="rounded-3xl border border-jet p-6 space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Renewals This Month</h2>
                <p className="text-sm text-silver">Weekly distribution (based on repeat rule).</p>
            </div>

            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows}>
                        <XAxis dataKey="week" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
