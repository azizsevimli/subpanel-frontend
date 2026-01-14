"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function RenewalsWeekBar({ data }) {
    const base = Array.isArray(data) ? data : [];

    const rows = base.map((x) => ({
        week: `W${x?.week ?? ""}`,
        count: Number(x?.count ?? 0),
    }));

    return (
        <div className="px-3 py-6 md:p-6 rounded-2xl md:rounded-3xl border border-jet space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Renewals This Month</h2>
                <p className="text-sm text-silver">Weekly distribution (based on repeat rule).</p>
            </div>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows}>
                        <XAxis dataKey="week" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: "#1F1F1F" }}
                            contentStyle={{
                                backgroundColor: "#F5F5F5",
                                color: "#0D0D0D",
                                borderRadius: 12,
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#60A5FA"
                            activeBar={{ fill: "#14b8a6" }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
